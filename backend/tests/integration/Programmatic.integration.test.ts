import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;
/** Programmatic integration routes — see `routes/publicApi/IntegrationRoutes.ts` (`{apiPrefix}/public/...`). */
const publicProgrammaticBase = `${apiPrefix}/public`;

/**
 * Programmatic API surface under `{apiPrefix}/public/...`: workspace is resolved from the org API key,
 * not a user JWT. This suite focuses on the per-channel endpoints (`integration-settings/:id`,
 * `integration-trigger/:id`) — auth, validation, and missing-channel behavior.
 *
 * Broader programmatic surface (connection check, channel listing, OAuth URL, delete) lives in
 * `SocialConnectionOrganization.integration.test.ts`.
 */
describe("Programmatic API (per-channel endpoints)", () => {
    const supabaseConfig = config.supabase as {
        supabaseUrl: string;
        supabaseSecretKey?: string;
    };
    const adminSupabase = createClient(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseSecretKey!
    ) as SupabaseClient;
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

    afterAll(() => {
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    afterEach(async () => {
        await userHelper.cleanAllStoredUsers();
    });

    async function signupVerifyAndSignIn(payload: {
        email: string;
        password: string;
        fullName: string;
    }): Promise<{ accessToken: string }> {
        const signupRes = await supertest(app).post(`${authPath}/sign-up`).send(payload);
        if (signupRes.body?.data?.session?.accessToken) {
            const token = signupRes.body.data.session.accessToken;
            const { data } = await adminSupabase.auth.getUser(token);
            if (data?.user?.id) userHelper.trackUser(data.user.id);
        }
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
        const accessToken = signInRes.body.data?.accessToken ?? signInRes.body.data?.session?.accessToken;
        expect(accessToken).toBeDefined();

        const meRes = await supertest(app)
            .get(`${usersPath}/me`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(meRes.status).toBe(200);

        return { accessToken: accessToken as string };
    }

    /** Rotate API key for the user’s first organization; asserts settings + rotate succeed. */
    async function createWorkspaceWithProgrammaticApiKey(): Promise<{ apiKey: string; orgId: string }> {
        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);

        const listRes = await supertest(app)
            .get(settingsPath)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(listRes.status).toBe(200);
        const orgId = listRes.body?.data?.[0]?.id as string;
        expect(orgId).toBeDefined();

        const rotateRes = await supertest(app)
            .post(`${settingsPath}/${orgId}/rotate-api-key`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(rotateRes.status).toBe(200);
        const apiKey = rotateRes.body?.data?.apiKey as string;
        expect(apiKey).toBeDefined();

        return { apiKey, orgId };
    }

    describe("fetching integration settings via programmatic API", () => {
        it("returns 401 when no API key is sent", async () => {
            const res = await supertest(app).get(`${publicProgrammaticBase}/integration-settings/${uuidv4()}`);
            expect(res.status).toBe(401);
        });

        it("rejects a non-UUID :id with 400 from the schema validator", async () => {
            const { apiKey } = await createWorkspaceWithProgrammaticApiKey();
            const res = await supertest(app)
                .get(`${publicProgrammaticBase}/integration-settings/not-a-uuid`)
                .set("Authorization", apiKey);
            expect(res.status).toBe(400);
        });

        it("returns 404 when the channel id does not exist for that workspace", async () => {
            const { apiKey } = await createWorkspaceWithProgrammaticApiKey();
            const res = await supertest(app)
                .get(`${publicProgrammaticBase}/integration-settings/${uuidv4()}`)
                .set("Authorization", apiKey);
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
            const { apiKey } = await createWorkspaceWithProgrammaticApiKey();
            const res = await supertest(app)
                .post(`${publicProgrammaticBase}/integration-trigger/${uuidv4()}`)
                .set("Authorization", apiKey)
                .send({});
            expect(res.status).toBe(400);
        });

        it("returns 404 when the channel id does not exist for that workspace", async () => {
            const { apiKey } = await createWorkspaceWithProgrammaticApiKey();
            const res = await supertest(app)
                .post(`${publicProgrammaticBase}/integration-trigger/${uuidv4()}`)
                .set("Authorization", apiKey)
                .send({ methodName: "getThings" });
            expect(res.status).toBe(404);
        });
    });
});
