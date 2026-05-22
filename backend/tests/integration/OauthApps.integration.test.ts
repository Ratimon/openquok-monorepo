import { faker } from "@faker-js/faker";
import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn as sharedSignupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;
const oauthAppsPath = `${apiPrefix}/oauth-apps`;
const publicProgrammaticBase = `${apiPrefix}/public`;

const supabaseConfig = config.supabase as { supabaseUrl?: string; supabaseSecretKey?: string };
const hasSupabaseIntegration = Boolean(
    supabaseConfig.supabaseUrl?.trim() && supabaseConfig.supabaseSecretKey?.trim()
);

describe("OAuth Apps (JWT-managed) + programmatic token auth", () => {
    let userHelper: UserTestHelper;

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;

    beforeAll(() => {
        verificationToken = generateRandomVerificationToken();
        getVerificationTokenSpy = jest
            .spyOn(EmailService.prototype, "generateVerificationToken")
            .mockImplementation(() => verificationToken);
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);

        if (hasSupabaseIntegration) {
            userHelper = new UserTestHelper();
        }
    });

    afterAll(async () => {
        if (userHelper) {
            await userHelper.cleanAll();
        }
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    afterEach(async () => {
        if (userHelper) {
            await cleanupIntegrationTestUsers(userHelper);
        }
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

    (hasSupabaseIntegration ? it : it.skip)("admin can create oauth app, approve, exchange code, and use access token on /public/is-connected", async () => {
        const payload = userHelper.setupTestUser1();
        const { accessToken, orgId } = await signupVerifyAndSignIn(payload);

        const createApp = await supertest(app)
            .post(oauthAppsPath)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                organizationId: orgId,
                name: `Test App ${faker.string.alphanumeric(6)}`,
                description: "Integration test app",
                redirectUrl: "https://example.com/callback",
            });
        expect(createApp.status).toBe(201);
        expect(createApp.body?.success).toBe(true);
        const oauthAppId = createApp.body?.data?.id as string;
        expect(oauthAppId).toBeDefined();
        const clientId = createApp.body?.data?.clientId as string;
        const clientSecret = createApp.body?.data?.clientSecret as string;
        expect(typeof clientId).toBe("string");
        expect(typeof clientSecret).toBe("string");

        const meta = await supertest(app)
            .get(`${apiPrefix}/oauth/authorize`)
            .query({ client_id: clientId, state: "xyz" });
        expect(meta.status).toBe(200);
        expect(meta.body?.app?.clientId).toBe(clientId);

        const approve = await supertest(app)
            .post(`${apiPrefix}/oauth/authorize`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ client_id: clientId, organizationId: orgId, state: "xyz", action: "approve" });
        expect(approve.status).toBe(200);
        const redirect = approve.body?.redirect as string;
        expect(typeof redirect).toBe("string");
        const locUrl = new URL(redirect);
        const code = locUrl.searchParams.get("code");
        expect(typeof code).toBe("string");

        const tokenRes = await supertest(app).post(`${apiPrefix}/oauth/token`).send({
            grant_type: "authorization_code",
            client_id: clientId,
            client_secret: clientSecret,
            code,
        });
        expect(tokenRes.status).toBe(200);
        const token = tokenRes.body?.access_token as string;
        expect(typeof token).toBe("string");
        expect(token).toMatch(/^opo_/);

        const connected = await supertest(app)
            .get(`${publicProgrammaticBase}/is-connected`)
            .set("Authorization", `Bearer ${token}`);
        expect(connected.status).toBe(200);
        expect(connected.body).toEqual({ connected: true });
    });
});

