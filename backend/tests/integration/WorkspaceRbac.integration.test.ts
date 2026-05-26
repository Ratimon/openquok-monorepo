import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { ACTIVE_ORGANIZATION_COOKIE } from "../../utils/session/sessionCookies";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    activateWorkspace,
    getFirstOrganizationId,
    prepareSoloWorkspace,
    prepareTeamWorkspace,
    restoreSoloWorkspaceSpies,
    type SoloWorkspaceSpies,
    type TeamWorkspaceSpies,
} from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const billingPath = `${apiPrefix}/billing`;
const settingsPath = `${apiPrefix}/settings`;

const PASSWORD = "Test1234!";

const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
const supabaseSecretKey = (config.supabase as { supabaseSecretKey?: string }).supabaseSecretKey;
const describeIfSupabase =
    supabaseUrl && supabaseSecretKey ? describe : describe.skip;

describeIfSupabase("Workspace RBAC (integration)", () => {
    const userHelper = new UserTestHelper();

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;

    beforeAll(() => {
        verificationToken = generateRandomVerificationToken();
        getVerificationTokenSpy = jest
            .spyOn(EmailService.prototype, "generateVerificationToken")
            .mockImplementation(() => verificationToken);
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);
    });

    afterAll(async () => {
        await userHelper.cleanAll();
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    afterEach(async () => {
        await cleanupIntegrationTestUsers(userHelper);
    });

    async function signUpAndGetToken(payload?: {
        email: string;
        password: string;
        fullName: string;
    }): Promise<{ accessToken: string; email: string }> {
        const signUpPayload = payload ?? userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(
            app,
            userHelper,
            authPath,
            verificationToken,
            signUpPayload
        );
        return { accessToken, email: signUpPayload.email };
    }

    async function acceptInviteForEmail(
        accessToken: string,
        organizationId: string
    ): Promise<void> {
        const pendingRes = await supertest(app)
            .get(`${settingsPath}/invites/pending`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(pendingRes.status).toBe(200);
        const invite = (pendingRes.body?.data ?? []).find(
            (row: { organizationId: string }) => row.organizationId === organizationId
        );
        expect(invite?.id).toBeDefined();
        const acceptRes = await supertest(app)
            .post(`${settingsPath}/invites/${invite.id}/accept`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(acceptRes.status).toBe(200);
        expect(acceptRes.body?.success).toBe(true);
    }

    type WorkspaceRoleTokens = {
        orgId: string;
        workspaceCookie: string[];
        owner: { accessToken: string };
        admin: { accessToken: string };
        member: { accessToken: string };
    };

    /** Owner plus admin and member who have accepted invites into the same workspace. */
    async function createWorkspaceWithRoles(): Promise<WorkspaceRoleTokens> {
        const { accessToken: ownerToken } = await signUpAndGetToken({
            email: `owner-${uuidv4()}@test.com`,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        });
        const orgId = await getFirstOrganizationId(ownerToken);
        await activateWorkspace(ownerToken, orgId);
        const workspaceCookie = [`${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`];

        const adminEmail = `admin-${uuidv4()}@test.com`;
        const ownerInviteAdminRes = await supertest(app)
            .post(`${settingsPath}/team`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .set("Cookie", workspaceCookie)
            .send({ email: adminEmail, workspaceRole: "admin", sendEmail: false });
        expect(ownerInviteAdminRes.status).toBe(200);

        const { accessToken: adminToken } = await signUpAndGetToken({
            email: adminEmail,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        });
        await acceptInviteForEmail(adminToken, orgId);
        await activateWorkspace(adminToken, orgId);

        const memberEmail = `member-${uuidv4()}@test.com`;
        const ownerInviteMemberRes = await supertest(app)
            .post(`${settingsPath}/team`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .set("Cookie", workspaceCookie)
            .send({ email: memberEmail, workspaceRole: "user", sendEmail: false });
        expect(ownerInviteMemberRes.status).toBe(200);

        const { accessToken: memberToken } = await signUpAndGetToken({
            email: memberEmail,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        });
        await acceptInviteForEmail(memberToken, orgId);
        await activateWorkspace(memberToken, orgId);

        return {
            orgId,
            workspaceCookie,
            owner: { accessToken: ownerToken },
            admin: { accessToken: adminToken },
            member: { accessToken: memberToken },
        };
    }

    async function ownerCreatesPendingInvite(
        ownerToken: string,
        workspaceCookie: string[]
    ): Promise<{ inviteId: string; inviteeEmail: string }> {
        const inviteeEmail = `pending-${uuidv4()}@test.com`.toLowerCase();
        const inviteRes = await supertest(app)
            .post(`${settingsPath}/team`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .set("Cookie", workspaceCookie)
            .send({ email: inviteeEmail, workspaceRole: "user", sendEmail: false });
        expect(inviteRes.status).toBe(200);
        expect(inviteRes.body?.success).toBe(true);

        const sentRes = await supertest(app)
            .get(`${settingsPath}/invites/sent`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .set("Cookie", workspaceCookie);
        expect(sentRes.status).toBe(200);
        const row = (sentRes.body?.data ?? []).find(
            (inv: { email?: string }) => inv.email?.toLowerCase() === inviteeEmail
        );
        expect(row?.id).toBeDefined();
        return { inviteId: row.id as string, inviteeEmail };
    }

    describe("Workspace session cookies", () => {
        let soloWorkspaceSpies: SoloWorkspaceSpies;

        beforeEach(() => {
            soloWorkspaceSpies = prepareSoloWorkspace();
        });

        afterEach(() => {
            restoreSoloWorkspaceSpies(soloWorkspaceSpies);
        });

        it("GET /users/me returns session fields when showorg cookie is set", async () => {
            const { accessToken } = await signUpAndGetToken();

            const orgId = await getFirstOrganizationId(accessToken);
            await activateWorkspace(accessToken, orgId);

            const meRes = await supertest(app)
                .get(`${usersPath}/me`)
                .set("Authorization", `Bearer ${accessToken}`)
                .set("Cookie", [`${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`]);

            expect(meRes.status).toBe(200);
            expect(meRes.body?.data?.orgId).toBe(orgId);
            expect(meRes.body?.data?.tier).toBe("SOLO");
        });

        it("POST /users/change-org sets showorg cookie", async () => {
            const { accessToken } = await signUpAndGetToken();
            const orgId = await getFirstOrganizationId(accessToken);

            const changeRes = await supertest(app)
                .post(`${usersPath}/change-org`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ id: orgId });

            expect(changeRes.status).toBe(200);
            expect(changeRes.body?.data?.id).toBe(orgId);
            const setCookie = changeRes.headers["set-cookie"];
            const cookieHeader = Array.isArray(setCookie) ? setCookie.join(";") : String(setCookie ?? "");
            expect(cookieHeader).toContain(`${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`);
        });

        it("GET /users/subscription and GET /billing use showorg cookie", async () => {
            const { accessToken } = await signUpAndGetToken();
            const orgId = await getFirstOrganizationId(accessToken);
            await activateWorkspace(accessToken, orgId);

            const cookieHeader = `${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`;

            const subRes = await supertest(app)
                .get(`${usersPath}/subscription`)
                .set("Authorization", `Bearer ${accessToken}`)
                .set("Cookie", [cookieHeader]);
            expect(subRes.status).toBe(200);
            expect(subRes.body?.data?.subscription?.organization_id).toBe(orgId);

            const billingRes = await supertest(app)
                .get(`${billingPath}/current`)
                .set("Authorization", `Bearer ${accessToken}`)
                .set("Cookie", [cookieHeader]);
            const billingWithQueryRes = await supertest(app)
                .get(`${billingPath}/current`)
                .query({ organizationId: orgId })
                .set("Authorization", `Bearer ${accessToken}`);
            expect(billingRes.status).toBe(200);
            expect(billingWithQueryRes.status).toBe(200);
            expect(billingRes.body?.data?.tier).toBe("SOLO");
        });
    });

    describe("Outbound invites (sent list and cancel)", () => {
        let teamWorkspaceSpies: TeamWorkspaceSpies;

        beforeEach(() => {
            teamWorkspaceSpies = prepareTeamWorkspace();
        });

        afterEach(() => {
            restoreSoloWorkspaceSpies(teamWorkspaceSpies);
        });

        it("owner can list sent invites and cancel a pending invite", async () => {
            const { owner, workspaceCookie } = await createWorkspaceWithRoles();
            const { inviteId, inviteeEmail } = await ownerCreatesPendingInvite(
                owner.accessToken,
                workspaceCookie
            );

            const cancelRes = await supertest(app)
                .delete(`${settingsPath}/invites/${inviteId}`)
                .set("Authorization", `Bearer ${owner.accessToken}`)
                .set("Cookie", workspaceCookie);
            expect(cancelRes.status).toBe(200);
            expect(cancelRes.body?.success).toBe(true);

            const sentAfterRes = await supertest(app)
                .get(`${settingsPath}/invites/sent`)
                .set("Authorization", `Bearer ${owner.accessToken}`)
                .set("Cookie", workspaceCookie);
            expect(sentAfterRes.status).toBe(200);
            const stillListed = (sentAfterRes.body?.data ?? []).some(
                (inv: { email?: string }) => inv.email?.toLowerCase() === inviteeEmail
            );
            expect(stillListed).toBe(false);
        });

        it("admin receives 403 when listing sent invites", async () => {
            const { owner, admin, workspaceCookie } = await createWorkspaceWithRoles();
            await ownerCreatesPendingInvite(owner.accessToken, workspaceCookie);

            const res = await supertest(app)
                .get(`${settingsPath}/invites/sent`)
                .set("Authorization", `Bearer ${admin.accessToken}`)
                .set("Cookie", workspaceCookie);
            expect(res.status).toBe(403);
            expect(res.body?.success).toBe(false);
        });

        it("admin receives 403 when cancelling a sent invite", async () => {
            const { owner, admin, workspaceCookie } = await createWorkspaceWithRoles();
            const { inviteId } = await ownerCreatesPendingInvite(owner.accessToken, workspaceCookie);

            const res = await supertest(app)
                .delete(`${settingsPath}/invites/${inviteId}`)
                .set("Authorization", `Bearer ${admin.accessToken}`)
                .set("Cookie", workspaceCookie);
            expect(res.status).toBe(403);
            expect(res.body?.success).toBe(false);
        });

        it("member receives 403 when listing sent invites", async () => {
            const { owner, member, workspaceCookie } = await createWorkspaceWithRoles();
            await ownerCreatesPendingInvite(owner.accessToken, workspaceCookie);

            const res = await supertest(app)
                .get(`${settingsPath}/invites/sent`)
                .set("Authorization", `Bearer ${member.accessToken}`)
                .set("Cookie", workspaceCookie);
            expect(res.status).toBe(403);
            expect(res.body?.success).toBe(false);
        });

        it("member receives 403 when cancelling a sent invite", async () => {
            const { owner, member, workspaceCookie } = await createWorkspaceWithRoles();
            const { inviteId } = await ownerCreatesPendingInvite(owner.accessToken, workspaceCookie);

            const res = await supertest(app)
                .delete(`${settingsPath}/invites/${inviteId}`)
                .set("Authorization", `Bearer ${member.accessToken}`)
                .set("Cookie", workspaceCookie);
            expect(res.status).toBe(403);
            expect(res.body?.success).toBe(false);
        });
    });

    describe("Team invite by workspace role", () => {
        let teamWorkspaceSpies: TeamWorkspaceSpies;

        beforeEach(() => {
            teamWorkspaceSpies = prepareTeamWorkspace();
        });

        afterEach(() => {
            restoreSoloWorkspaceSpies(teamWorkspaceSpies);
        });

        it("owner can send a team invite", async () => {
            const { owner, workspaceCookie } = await createWorkspaceWithRoles();
            const inviteeEmail = `invitee-${uuidv4()}@test.com`;

            const res = await supertest(app)
                .post(`${settingsPath}/team`)
                .set("Authorization", `Bearer ${owner.accessToken}`)
                .set("Cookie", workspaceCookie)
                .send({ email: inviteeEmail, workspaceRole: "user", sendEmail: false });

            expect(res.status).toBe(200);
            expect(res.body?.success).toBe(true);
        });

        it("admin can send a team invite", async () => {
            const { admin, workspaceCookie } = await createWorkspaceWithRoles();
            const inviteeEmail = `invitee-${uuidv4()}@test.com`;

            const res = await supertest(app)
                .post(`${settingsPath}/team`)
                .set("Authorization", `Bearer ${admin.accessToken}`)
                .set("Cookie", workspaceCookie)
                .send({ email: inviteeEmail, workspaceRole: "user", sendEmail: false });

            expect(res.status).toBe(200);
            expect(res.body?.success).toBe(true);
        });

        it("member receives 403 when sending a team invite", async () => {
            const { member, workspaceCookie } = await createWorkspaceWithRoles();
            const inviteeEmail = `invitee-${uuidv4()}@test.com`;

            const res = await supertest(app)
                .post(`${settingsPath}/team`)
                .set("Authorization", `Bearer ${member.accessToken}`)
                .set("Cookie", workspaceCookie)
                .send({ email: inviteeEmail, workspaceRole: "user", sendEmail: false });

            expect(res.status).toBe(403);
            expect(res.body?.success).toBe(false);
        });
    });
});
