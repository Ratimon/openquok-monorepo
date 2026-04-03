/// <reference types="jest" />
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
/** Programmatic integration routes — see `routes/publicApi/integrationRoutes.ts` (`{apiPrefix}/public/...`). */
const publicProgrammaticBase = `${apiPrefix}/public`;
/** Session integration routes — see `routes/integrations/sessionRoutes.ts`. */
const sessionIntegrationsBase = `${apiPrefix}/integrations`;

const threadsOAuthConfigured = Boolean(
    (config.integrations as { threads?: { appId?: string } } | undefined)?.threads?.appId
);
const itIfThreadsOAuth = threadsOAuthConfigured ? it : it.skip;

/**
 * Organization-scoped programmatic API (`{apiPrefix}/public`): workspace is resolved from the org API key,
 * not from the user session. Contrasts with `/integrations` session routes (JWT + org in query/body).
 *
 * Depends on DB RPCs `internal_list_integrations_by_org`, `internal_get_integration_by_org_and_id`,
 * and `internal_soft_delete_integration` (see `supabase/db/integration/406_20260402_functions.sql`).
 * Apply migrations to the test project before running this suite.
 */
describe("Social connection (organization programmatic API)", () => {
    const supabaseConfig = config.supabase as {
        supabaseUrl: string;
        supabaseServiceRoleKey?: string;
    };
    const adminSupabase = createClient(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseServiceRoleKey!
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

    describe("contrast with session integration routes", () => {
        it("exposes the provider catalog at GET /integrations without a user JWT", async () => {
            const res = await supertest(app).get(sessionIntegrationsBase);
            expect(res.status).toBe(200);
            expect(res.body?.success).toBe(true);
            expect(Array.isArray(res.body?.data?.social)).toBe(true);
        });

        it("does not accept a session JWT as the programmatic API key", async () => {
            const payload = userHelper.setupTestUser1();
            const { accessToken } = await signupVerifyAndSignIn(payload);

            const res = await supertest(app)
                .get(`${publicProgrammaticBase}/is-connected`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(401);
            expect(res.body?.msg).toBe("Invalid API key");
        });
    });

    describe("programmatic API authentication", () => {
        it("responds 401 with a clear message when Authorization is missing", async () => {
            const res = await supertest(app).get(`${publicProgrammaticBase}/is-connected`);
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ msg: "No API key provided" });
        });

        it("responds 401 when the key is not a registered organization API key", async () => {
            const res = await supertest(app)
                .get(`${publicProgrammaticBase}/is-connected`)
                .set("Authorization", "co_not_a_real_key_000000000000000000000000");
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ msg: "Invalid API key" });
        });

        it("accepts the raw key or Bearer-prefixed key equivalently", async () => {
            const { apiKey } = await createWorkspaceWithProgrammaticApiKey();

            const raw = await supertest(app)
                .get(`${publicProgrammaticBase}/is-connected`)
                .set("Authorization", apiKey);
            expect(raw.status).toBe(200);
            expect(raw.body).toEqual({ connected: true });

            const bearer = await supertest(app)
                .get(`${publicProgrammaticBase}/is-connected`)
                .set("Authorization", `Bearer ${apiKey}`);
            expect(bearer.status).toBe(200);
            expect(bearer.body).toEqual({ connected: true });
        });
    });

    describe("connection check and channel listing", () => {
        it("reports connected when a valid programmatic key is supplied", async () => {
            const { apiKey } = await createWorkspaceWithProgrammaticApiKey();

            const res = await supertest(app)
                .get(`${publicProgrammaticBase}/is-connected`)
                .set("Authorization", apiKey);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ connected: true });
        });

        it("returns 401 for channel list when no API key is sent", async () => {
            const res = await supertest(app).get(`${publicProgrammaticBase}/integrations`);
            expect(res.status).toBe(401);
            expect(res.body?.msg).toBe("No API key provided");
        });

        it("returns an empty array when the workspace has no connected channels", async () => {
            const { apiKey } = await createWorkspaceWithProgrammaticApiKey();

            const res = await supertest(app)
                .get(`${publicProgrammaticBase}/integrations`)
                .set("Authorization", apiKey);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toEqual([]);
        });
    });

    describe("OAuth URL for connecting a channel", () => {
        it("rejects unknown provider identifiers", async () => {
            const { apiKey } = await createWorkspaceWithProgrammaticApiKey();

            const res = await supertest(app)
                .get(`${publicProgrammaticBase}/social/${encodeURIComponent("not-a-real-provider")}`)
                .set("Authorization", apiKey);

            expect(res.status).toBe(400);
            expect(res.body?.message ?? res.body?.error?.message).toMatch(/not allowed/i);
        });

        itIfThreadsOAuth("returns an authorization URL when Threads OAuth is configured", async () => {
            const { apiKey } = await createWorkspaceWithProgrammaticApiKey();

            const res = await supertest(app)
                .get(`${publicProgrammaticBase}/social/threads`)
                .set("Authorization", apiKey);

            expect(res.status).toBe(200);
            expect(typeof res.body?.url).toBe("string");
            expect(res.body.url).toMatch(/^https?:\/\//);
        });

        it("rejects invalid refresh query (must be a UUID when present)", async () => {
            const { apiKey } = await createWorkspaceWithProgrammaticApiKey();

            const res = await supertest(app)
                .get(`${publicProgrammaticBase}/social/threads`)
                .query({ refresh: "not-a-uuid" })
                .set("Authorization", apiKey);

            expect(res.status).toBe(400);
        });
    });

    describe("removing a connected channel", () => {
        it("returns 404 when the channel id does not exist for that workspace", async () => {
            const { apiKey } = await createWorkspaceWithProgrammaticApiKey();
            const fakeId = uuidv4();

            const res = await supertest(app)
                .delete(`${publicProgrammaticBase}/integrations/${fakeId}`)
                .set("Authorization", apiKey);

            expect(res.status).toBe(404);
        });
    });
});
