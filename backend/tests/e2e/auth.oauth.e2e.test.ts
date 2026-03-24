import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { UserTestHelper } from "../helpers/userTestHelper";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const serverConfig = config.server as { frontendDomainUrl?: string };
const frontendUrl = serverConfig.frontendDomainUrl ?? "http://localhost:5173";

/** True when Google OAuth env vars are set (redirect URL tests and callback with mock depend on it). */
function isGoogleOAuthConfigured(): boolean {
    const oauth = config.oauth as { google?: { clientId?: string; clientSecret?: string } } | undefined;
    return !!(oauth?.google?.clientId && oauth?.google?.clientSecret);
}

describe("OAuth (Google) E2E", () => {
    const userHelper = new UserTestHelper();

    afterAll(async () => {
        await userHelper.cleanAllStoredUsers();
        await userHelper.cleanTestUsersByEmailPattern();
    });

    describe("Discovering available OAuth providers", () => {
        it("user can see list of configured providers (e.g. Google when configured)", async () => {
            const res = await supertest(app).get(`${authPath}/oauth/providers`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("providers");
            expect(Array.isArray(res.body.data.providers)).toBe(true);
            // When Google is configured it should be in the list
            if (isGoogleOAuthConfigured()) {
                expect(res.body.data.providers).toContain("google");
            }
        });
    });

    describe("Initiating OAuth sign-in (redirect URL)", () => {
        it("invalid provider name is rejected", async () => {
            const res = await supertest(app).get(`${authPath}/oauth/invalid_provider`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/invalid|missing/i);
        });

        it("user gets Google auth URL when Google OAuth is configured", async () => {
            if (!isGoogleOAuthConfigured()) {
                return;
            }

            const res = await supertest(app)
                .get(`${authPath}/oauth/google`)
                .query({ state: "test-state" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("url");
            expect(typeof res.body.data.url).toBe("string");
            expect(res.body.data.url).toContain("accounts.google.com");
            expect(res.body.data.url).toContain("client_id=");
            expect(res.body.data.url).toContain("redirect_uri=");
            expect(res.body.data.url).toContain("response_type=code");
            if (res.body.data.url.includes("state=")) {
                expect(res.body.data.url).toContain("test-state");
            }
        });
    });

    describe("OAuth callback (completing sign-in)", () => {
        it("callback redirects to auth-error when code is missing", async () => {
            const res = await supertest(app)
                .get(`${authPath}/oauth/google/callback`)
                .redirects(0);

            expect(res.status).toBe(302);
            expect(res.headers.location).toBeDefined();
            expect(res.headers.location).toContain("/auth-error");
            expect(res.headers.location).toContain("message=");
            expect(decodeURIComponent(res.headers.location)).toMatch(/missing code/i);
            expect(res.headers.location).toMatch(
                new RegExp(`^${frontendUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)
            );
        });

        it("callback redirects to auth-error when provider is invalid", async () => {
            const res = await supertest(app)
                .get(`${authPath}/oauth/invalid/callback`)
                .query({ code: "some-code" })
                .redirects(0);

            expect(res.status).toBe(302);
            expect(res.headers.location).toContain("/auth-error");
            expect(decodeURIComponent(res.headers.location)).toMatch(/invalid provider/i);
        });

        it("callback redirects to auth-error when code is invalid (e.g. expired or fake)", async () => {
            if (!isGoogleOAuthConfigured()) {
                return;
            }

            const res = await supertest(app)
                .get(`${authPath}/oauth/google/callback`)
                .query({ code: "invalid-test-code" })
                .redirects(0);

            // Exchange with Google will fail or our backend will fail; we expect redirect to auth-error
            expect(res.status).toBe(302);
            expect(res.headers.location).toContain("/auth-error");
            expect(res.headers.location).toContain("message=");
        });
    });
});
