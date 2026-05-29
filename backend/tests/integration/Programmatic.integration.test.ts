import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn as sharedSignupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import {
    exchangeOAuthProgrammaticToken,
    programmaticBearerAuth,
} from "../helpers/programmaticAuthTestHelper";
import {
    prepareSoloWorkspace,
    restoreSoloWorkspaceSpies,
    type SoloWorkspaceSpies,
} from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;
/** Programmatic integration routes — see `routes/publicApi/IntegrationRoutes.ts` (`{apiPrefix}/public/...`). */
const publicProgrammaticBase = `${apiPrefix}/public`;

/**
 * Programmatic API surface under `{apiPrefix}/public/...`: workspace is resolved from an OAuth app token,
 * not a user JWT. This suite focuses on the per-channel endpoints (`integration-settings/:id`,
 * `integration-trigger/:id`) — auth, validation, and missing-channel behavior.
 *
 * Broader programmatic surface (connection check, channel listing, OAuth URL, delete) lives in
 * `SocialConnectionOrganization.integration.test.ts`.
 */
describe("Programmatic API (per-channel endpoints)", () => {
    const userHelper = new UserTestHelper();

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;
    let soloWorkspaceSpies: SoloWorkspaceSpies | undefined;

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

    beforeEach(() => {
        soloWorkspaceSpies = prepareSoloWorkspace();
    });

    afterEach(async () => {
        restoreSoloWorkspaceSpies(soloWorkspaceSpies);
        soloWorkspaceSpies = undefined;
        await cleanupIntegrationTestUsers(userHelper);
    });

    async function signupVerifyAndSignIn(payload: {
        email: string;
        password: string;
        fullName: string;
    }): Promise<{ accessToken: string; orgId: string }> {
        const { accessToken } = await sharedSignupVerifyAndSignIn(
            app,
            userHelper,
            authPath,
            verificationToken,
            payload
        );

        const meRes = await supertest(app)
            .get(`${usersPath}/me`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(meRes.status).toBe(200);

        const listRes = await supertest(app)
            .get(settingsPath)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(listRes.status).toBe(200);
        const orgId = listRes.body?.data?.[0]?.id as string;
        expect(orgId).toBeDefined();

        return { accessToken, orgId };
    }

    async function createWorkspaceWithOAuthToken(): Promise<{ bearerToken: string; orgId: string }> {
        const payload = userHelper.setupTestUser1();
        const { accessToken, orgId } = await signupVerifyAndSignIn(payload);
        const bearerToken = await exchangeOAuthProgrammaticToken(accessToken, orgId);
        return { bearerToken, orgId };
    }

    describe("fetching integration settings via programmatic API", () => {
        it("returns 401 when no API key is sent", async () => {
            const res = await supertest(app).get(`${publicProgrammaticBase}/integration-settings/${uuidv4()}`);
            expect(res.status).toBe(401);
        });

        it("rejects a non-UUID :id with 400 from the schema validator", async () => {
            const { bearerToken } = await createWorkspaceWithOAuthToken();
            const res = await supertest(app)
                .get(`${publicProgrammaticBase}/integration-settings/not-a-uuid`)
                .set(programmaticBearerAuth(bearerToken));
            expect(res.status).toBe(400);
        });

        it("returns 404 when the channel id does not exist for that workspace", async () => {
            const { bearerToken } = await createWorkspaceWithOAuthToken();
            const res = await supertest(app)
                .get(`${publicProgrammaticBase}/integration-settings/${uuidv4()}`)
                .set(programmaticBearerAuth(bearerToken));
            expect(res.status).toBe(404);
        });
    });

    describe("invoking a provider tool via programmatic API", () => {
        it("returns 401 when no API key is sent", async () => {
            const res = await supertest(app)
                .post(`${publicProgrammaticBase}/integration-trigger/${uuidv4()}`)
                .send({ methodName: "getThings" });
            expect(res.status).toBe(401);
        });

        it("rejects missing methodName with 400", async () => {
            const { bearerToken } = await createWorkspaceWithOAuthToken();
            const res = await supertest(app)
                .post(`${publicProgrammaticBase}/integration-trigger/${uuidv4()}`)
                .set(programmaticBearerAuth(bearerToken))
                .send({});
            expect(res.status).toBe(400);
        });

        it("returns 404 when the channel id does not exist for that workspace", async () => {
            const { bearerToken } = await createWorkspaceWithOAuthToken();
            const res = await supertest(app)
                .post(`${publicProgrammaticBase}/integration-trigger/${uuidv4()}`)
                .set(programmaticBearerAuth(bearerToken))
                .send({ methodName: "getThings" });
            expect(res.status).toBe(404);
        });
    });
});
