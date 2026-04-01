import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { AuthenticationService } from "../../services/AuthenticationService";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;

const serverConfig = config.server as { frontendDomainUrl?: string };
const frontendUrl = serverConfig.frontendDomainUrl ?? "http://localhost:5173";

describe("Google OAuth E2E Tests", () => {
    describe("GET /auth/oauth/google/callback", () => {
        
        it("should redirect to frontend auth-error when the code query param is missing", async () => {
            const res = await supertest(app).get(`${authPath}/oauth/google/callback`).redirects(0);

            expect(res.status).toBe(302);
            expect(res.headers.location).toBe(
                `${frontendUrl}/auth-error?message=${encodeURIComponent("Google sign-in failed. Please try again.")}`
            );
        });

        it("should redirect to frontend auth-error when the OAuth code cannot be exchanged", async () => {
            const res = await supertest(app)
                .get(`${authPath}/oauth/google/callback?code=invalid-test-oauth-code-not-real`)
                .redirects(0);

            expect(res.status).toBe(302);
            const location = res.headers.location ?? "";
            expect(location).toContain(`${frontendUrl}/auth-error`);
            expect(location).toContain("message=");
        });

        describe("with mocked successful code exchange", () => {
            const mockUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

            afterEach(() => {
                jest.restoreAllMocks();
            });

            it("should redirect to frontend next path when next is a safe relative path", async () => {
                jest.spyOn(AuthenticationService.prototype, "exchangeOAuthCodeForSession").mockResolvedValue({
                    session: { access_token: "test-access-token", refresh_token: "test-refresh-token" },
                    user: { id: mockUserId },
                });
                jest.spyOn(AuthenticationService.prototype, "generateRefreshToken").mockResolvedValue({
                    id: "token-row-id",
                    userId: mockUserId,
                    token: "test-refresh-token",
                    createdAt: new Date().toISOString(),
                    expiresAt: new Date().toISOString(),
                });

                const res = await supertest(app)
                    .get(`${authPath}/oauth/google/callback?code=mock-code&next=/dashboard`)
                    .redirects(0);

                expect(res.status).toBe(302);
                expect(res.headers.location).toBe(`${frontendUrl}/dashboard`);
                const cookies = res.headers["set-cookie"];
                expect(cookies).toEqual(
                    expect.arrayContaining([expect.stringMatching(/refreshToken=/i)])
                );
            });

            it("should reject open-redirect next values and redirect to / when exchange succeeds", async () => {
                jest.spyOn(AuthenticationService.prototype, "exchangeOAuthCodeForSession").mockResolvedValue({
                    session: { access_token: "a", refresh_token: "r" },
                    user: { id: mockUserId },
                });
                jest.spyOn(AuthenticationService.prototype, "generateRefreshToken").mockResolvedValue({
                    id: "token-row-id",
                    userId: mockUserId,
                    token: "r",
                    createdAt: new Date().toISOString(),
                    expiresAt: new Date().toISOString(),
                });

                const res = await supertest(app)
                    .get(
                        `${authPath}/oauth/google/callback?code=mock-code&next=${encodeURIComponent("https://evil.example/phish")}`
                    )
                    .redirects(0);

                expect(res.status).toBe(302);
                expect(res.headers.location).toBe(`${frontendUrl}/`);
            });
        });
    });

    describe("GET /auth/oauth/google", () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should redirect to the OAuth authorize URL returned by the authentication service", async () => {
            const fakeAuthorizeUrl = "https://oauth.stub.test/authorize?provider=google";
            jest.spyOn(AuthenticationService.prototype, "getOAuthSignInUrl").mockResolvedValue(fakeAuthorizeUrl);

            const res = await supertest(app).get(`${authPath}/oauth/google`).redirects(0);

            expect(res.status).toBe(302);
            expect(res.headers.location).toBe(fakeAuthorizeUrl);
        });

        it("should pass a safe next query string through to getOAuthSignInUrl", async () => {
            const spy = jest
                .spyOn(AuthenticationService.prototype, "getOAuthSignInUrl")
                .mockResolvedValue("https://oauth.stub.test/authorize");

            await supertest(app).get(`${authPath}/oauth/google?next=/account`).redirects(0);

            expect(spy).toHaveBeenCalledWith("google", expect.any(Object), { next: "/account" });
        });
    });
});
