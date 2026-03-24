import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;

interface SignupPayload {
    email: string;
    password: string;
    fullName?: string;
}

async function requestSignup(
    payload: SignupPayload,
    adminSupabase: SupabaseClient,
    userHelper: UserTestHelper
) {
    const res = await supertest(app).post(`${authPath}/sign-up`).send(payload);
    if (res.body?.success && res.body?.data?.session?.accessToken) {
        const token = res.body.data.session.accessToken;
        const {
            data: { user },
        } = await adminSupabase.auth.getUser(token);
        if (user?.id) userHelper.trackUser(user.id);
    }
    return res;
}

/** Sign up, verify email, sign in; returns access token for the user. */
async function signUpVerifyAndSignIn(
    payload: SignupPayload,
    verificationToken: string,
    adminSupabase: SupabaseClient,
    userHelper: UserTestHelper
): Promise<string> {
    const signupRes = await requestSignup(payload, adminSupabase, userHelper);
    expect(signupRes.status).toBe(201);

    const verifyRes = await supertest(app).get(
        `${authPath}/verify-signup?token=${verificationToken}&email=${encodeURIComponent(payload.email)}`
    );
    expect(verifyRes.status).toBe(200);

    const signInRes = await supertest(app).post(`${authPath}/sign-in`).send({
        email: payload.email,
        password: payload.password,
    });
    expect(signInRes.status).toBe(200);
    expect(signInRes.body.data?.accessToken).toBeDefined();
    return signInRes.body.data.accessToken;
}

/** GET /settings and return the first organization id (e.g. default org after signup). */
async function getFirstOrgId(accessToken: string): Promise<string> {
    const res = await supertest(app)
        .get(settingsPath)
        .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    const first = res.body.data[0];
    expect(first.id).toBeDefined();
    return first.id;
}

describe("User Account Setting E2E", () => {
    const supabaseConfig = config.supabase as {
        supabaseUrl: string;
        supabaseServiceRoleKey?: string;
    };
    const adminSupabase = createClient(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseServiceRoleKey!
    );
    const userHelper = new UserTestHelper();

    let testUser: { email: string; password: string; fullName: string };
    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;

    beforeAll(async () => {
        await userHelper.cleanTestUsersByEmailPattern();
        verificationToken = generateRandomVerificationToken();
        getVerificationTokenSpy = jest
            .spyOn(EmailService.prototype, "generateVerificationToken")
            .mockImplementation(() => verificationToken);
        jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);
    });

    afterAll(async () => {
        getVerificationTokenSpy?.mockRestore();
        await userHelper.cleanAllStoredUsers();
        await userHelper.cleanTestUsersByEmailPattern();
    });

    beforeEach(() => {
        testUser = userHelper.setupTestUser1();
    });

    afterEach(async () => {
        await userHelper.cleanAllStoredUsers();
    });

    describe("Viewing own profile (current user)", () => {
        it("unauthenticated request is rejected", async () => {
            const res = await supertest(app).get(`${usersPath}/me`);
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("invalid Bearer token is rejected", async () => {
            const res = await supertest(app)
                .get(`${usersPath}/me`)
                .set("Authorization", "Bearer invalid-token");
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("authenticated user can fetch their profile with email and fullName", async () => {
            await requestSignup(
                { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );

            const verifyRes = await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}&email=${encodeURIComponent(testUser.email)}`
            );
            expect(verifyRes.status).toBe(200);

            const signInRes = await supertest(app).post(`${authPath}/sign-in`).send({
                email: testUser.email,
                password: testUser.password,
            });
            expect(signInRes.status).toBe(200);
            expect(signInRes.body.success).toBe(true);
            const accessToken = signInRes.body.data?.accessToken;
            expect(accessToken).toBeDefined();

            const meRes = await supertest(app)
                .get(`${usersPath}/me`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(meRes.status).toBe(200);
            expect(meRes.body.success).toBe(true);
            expect(meRes.body.data).toMatchObject({
                email: testUser.email,
                fullName: testUser.fullName,
                isEmailVerified: true,
            });
            expect(meRes.body.data.id).toBeDefined();
        });
    });

    describe("Changing password", () => {
        let accessToken: string;
        let originalPassword: string;

        beforeEach(async () => {
            originalPassword = testUser.password;
            await requestSignup(
                { email: testUser.email, password: originalPassword, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );

            const verifyRes = await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}`
            );
            expect(verifyRes.status).toBe(200);

            const signInRes = await supertest(app).post(`${authPath}/sign-in`).send({
                email: testUser.email,
                password: testUser.password,
            });
            expect(signInRes.status).toBe(200);
            expect(signInRes.body.success).toBe(true);
            accessToken = signInRes.body.data?.accessToken;
        });

        it("user can update password and sign in with new password", async () => {
            const newPassword = "NewSecurePassword123!";

            const updateRes = await supertest(app)
                .put(`${usersPath}/me/password`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ password: newPassword });

            expect(updateRes.status).toBe(200);
            expect(updateRes.body.success).toBe(true);
            expect(updateRes.body.message).toBe("Password updated successfully");

            const signInNew = await supertest(app).post(`${authPath}/sign-in`).send({
                email: testUser.email,
                password: newPassword,
            });
            expect(signInNew.status).toBe(200);
            expect(signInNew.body.success).toBe(true);

            const signInOld = await supertest(app).post(`${authPath}/sign-in`).send({
                email: testUser.email,
                password: originalPassword,
            });
            expect(signInOld.status).toBe(401);
            expect(signInOld.body.success).toBe(false);
        });

        it("unauthenticated request is rejected", async () => {
            const res = await supertest(app)
                .put(`${usersPath}/me/password`)
                .send({ password: "NewSecurePassword123!" });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("invalid Bearer token is rejected", async () => {
            const res = await supertest(app)
                .put(`${usersPath}/me/password`)
                .set("Authorization", "Bearer invalid-token")
                .send({ password: "NewSecurePassword123!" });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("weak password is rejected", async () => {
            const res = await supertest(app)
                .put(`${usersPath}/me/password`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ password: "weak" });
            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it("missing password in body is rejected", async () => {
            const res = await supertest(app)
                .put(`${usersPath}/me/password`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });
    });

    describe("Workspace membership: inviting members", () => {
        const password = "Test1234!";

        it("owner can invite a user by email as admin; invitee signs up, accepts invite, and appears in team as admin", async () => {
            const ownerEmail = testUser.email;
            const inviteeEmail = `invitee-${uuidv4()}@test.com`;

            const ownerToken = await signUpVerifyAndSignIn(
                { email: ownerEmail, password: testUser.password, fullName: testUser.fullName },
                verificationToken,
                adminSupabase,
                userHelper
            );
            const orgId = await getFirstOrgId(ownerToken);

            const inviteRes = await supertest(app)
                .post(`${settingsPath}/${orgId}/invite`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({ email: inviteeEmail, workspaceRole: "admin", sendEmail: false });
            expect(inviteRes.status).toBe(200);
            expect(inviteRes.body.success).toBe(true);
            expect(inviteRes.body.data?.url).toBeDefined();

            const inviteeToken = await signUpVerifyAndSignIn(
                { email: inviteeEmail, password, fullName: faker.person.fullName() },
                verificationToken,
                adminSupabase,
                userHelper
            );

            const pendingRes = await supertest(app)
                .get(`${settingsPath}/invites/pending`)
                .set("Authorization", `Bearer ${inviteeToken}`);
            expect(pendingRes.status).toBe(200);
            expect(Array.isArray(pendingRes.body.data)).toBe(true);
            const invite = pendingRes.body.data.find(
                (p: { organizationId: string }) => p.organizationId === orgId
            );
            expect(invite).toBeDefined();
            expect(invite.workspaceRole).toBe("admin");

            const acceptRes = await supertest(app)
                .post(`${settingsPath}/invites/${invite.id}/accept`)
                .set("Authorization", `Bearer ${inviteeToken}`);
            expect(acceptRes.status).toBe(200);
            expect(acceptRes.body.success).toBe(true);
            expect(acceptRes.body.data?.organizationId).toBe(orgId);
            expect(acceptRes.body.data?.workspaceRole).toBe("admin");

            const teamRes = await supertest(app)
                .get(`${settingsPath}/${orgId}/team`)
                .set("Authorization", `Bearer ${ownerToken}`);
            expect(teamRes.status).toBe(200);
            expect(Array.isArray(teamRes.body.data)).toBe(true);
            const inviteeMember = teamRes.body.data.find(
                (m: { email?: string }) => m.email?.toLowerCase() === inviteeEmail.toLowerCase()
            );
            expect(inviteeMember).toBeDefined();
            expect(inviteeMember.workspaceRole).toBe("admin");
        });

        it("new admin can invite another user; that user accepts and joins, and admin can see them in team", async () => {
            const ownerEmail = testUser.email;
            const adminEmail = `admin-${uuidv4()}@test.com`;
            const memberEmail = `member-${uuidv4()}@test.com`;

            const ownerToken = await signUpVerifyAndSignIn(
                { email: ownerEmail, password: testUser.password, fullName: faker.person.fullName() },
                verificationToken,
                adminSupabase,
                userHelper
            );
            const orgId = await getFirstOrgId(ownerToken);

            const ownerInviteRes = await supertest(app)
                .post(`${settingsPath}/${orgId}/invite`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({ email: adminEmail, workspaceRole: "admin", sendEmail: false });
            expect(ownerInviteRes.status).toBe(200);
            const adminToken = await signUpVerifyAndSignIn(
                { email: adminEmail, password, fullName: faker.person.fullName() },
                verificationToken,
                adminSupabase,
                userHelper
            );
            const adminPending = await supertest(app)
                .get(`${settingsPath}/invites/pending`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(adminPending.status).toBe(200);
            const adminInvite = adminPending.body.data.find(
                (p: { organizationId: string }) => p.organizationId === orgId
            );
            expect(adminInvite).toBeDefined();
            await supertest(app)
                .post(`${settingsPath}/invites/${adminInvite.id}/accept`)
                .set("Authorization", `Bearer ${adminToken}`);

            const inviteRes = await supertest(app)
                .post(`${settingsPath}/${orgId}/invite`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ email: memberEmail, workspaceRole: "user", sendEmail: false });
            expect(inviteRes.status).toBe(200);
            expect(inviteRes.body.success).toBe(true);

            const memberToken = await signUpVerifyAndSignIn(
                { email: memberEmail, password, fullName: faker.person.fullName() },
                verificationToken,
                adminSupabase,
                userHelper
            );
            const memberPending = await supertest(app)
                .get(`${settingsPath}/invites/pending`)
                .set("Authorization", `Bearer ${memberToken}`);
            expect(memberPending.status).toBe(200);
            const memberInvite = memberPending.body.data.find(
                (p: { organizationId: string }) => p.organizationId === orgId
            );
            expect(memberInvite).toBeDefined();
            const memberAccept = await supertest(app)
                .post(`${settingsPath}/invites/${memberInvite.id}/accept`)
                .set("Authorization", `Bearer ${memberToken}`);
            expect(memberAccept.status).toBe(200);
            expect(memberAccept.body.data?.workspaceRole).toBe("user");

            const teamRes = await supertest(app)
                .get(`${settingsPath}/${orgId}/team`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(teamRes.status).toBe(200);
            const members = teamRes.body.data as { email?: string; workspaceRole?: string }[];
            expect(
                members.some(
                    (m) =>
                        m.email?.toLowerCase() === memberEmail.toLowerCase() &&
                        m.workspaceRole === "user"
                )
            ).toBe(true);
        });
    });
});
