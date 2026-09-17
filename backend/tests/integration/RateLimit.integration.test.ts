import supertest from "supertest";
import { app } from "../../app";
import { config } from "../../config/GlobalConfig";

/**
 * Rate limit integration tests. Requires RATE_LIMIT_ENABLED=true.
 *
 * Limits are forced low in `jest.integration.ratelimit.env.cjs` so the suite
 * does not flood request loops against values from `.env.*.local`.
 */
describe("Rate limit", () => {
    const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
    const rl = config.rateLimit as {
        enabled?: boolean;
        global?: { max?: number; windowMs?: number };
        publicRead?: { max?: number };
        session?: { max?: number };
        auth?: { max?: number };
        publicApi?: { max?: number };
        mcp?: { max?: number; windowMs?: number };
        upload?: Record<string, unknown>;
        feedback?: { max?: number };
    };

    const globalLimit = rl.global?.max ?? 3;
    const publicReadLimit = rl.publicRead?.max ?? 3;
    const sessionLimit = rl.session?.max ?? 3;
    const authLimit = rl.auth?.max ?? 3;
    const publicApiLimit = rl.publicApi?.max ?? 3;
    const mcpLimit = rl.mcp?.max ?? 3;
    const feedbackLimit = rl.feedback?.max ?? 3;

    /** Fire requests until 429 (or give up slightly past the configured max). */
    async function untilRateLimited(
        requestFn: () => Promise<supertest.Response>,
        limit: number
    ): Promise<supertest.Response> {
        let last: supertest.Response | undefined;
        for (let i = 0; i < limit + 2; i++) {
            last = await requestFn();
            if (last.status === 429) return last;
        }
        throw new Error(
            `Expected 429 within ${limit + 2} requests (last status=${last?.status})`
        );
    }

    it("loads low test limits from the dedicated Jest env (guards against .env.*.local)", () => {
        expect(rl.enabled).toBe(true);
        expect(globalLimit).toBeLessThanOrEqual(5);
        expect(publicReadLimit).toBeLessThanOrEqual(5);
        expect(sessionLimit).toBeLessThanOrEqual(5);
        expect(authLimit).toBeLessThanOrEqual(5);
        expect(publicApiLimit).toBeLessThanOrEqual(5);
        expect(mcpLimit).toBeLessThanOrEqual(5);
        expect(feedbackLimit).toBeLessThanOrEqual(5);
        expect(rl.global).toMatchObject({
            windowMs: expect.any(Number),
            max: expect.any(Number),
            standardHeaders: true,
            legacyHeaders: false,
        });
        expect(rl.auth).toBeDefined();
        expect(rl.publicApi).toBeDefined();
        expect(rl.mcp).toBeDefined();
        expect(rl.upload).toBeDefined();
        expect(rl.feedback).toBeDefined();
    });

    describe("Global rate limiting", () => {
        const endpoint = `${apiPrefix}/auth/status`;

        it("returns 429 with retryAfter when exceeded", async () => {
            const limited = await untilRateLimited(
                () =>
                    supertest(app)
                        .get(endpoint)
                        .set("X-Forwarded-For", "192.168.1.100"),
                globalLimit
            );
            expect(limited.body).toMatchObject({
                status: "error",
                message: expect.stringContaining("Too many requests"),
            });
            expect(typeof limited.body.retryAfter).toBe("number");
            expect(limited.body.retryAfter).toBeGreaterThan(0);
            const windowMs = rl.global?.windowMs ?? 3600000;
            expect(limited.body.retryAfter).toBeLessThanOrEqual(Math.ceil(windowMs / 1000));
        });

        it("isolates limits by IP", async () => {
            await untilRateLimited(
                () =>
                    supertest(app)
                        .get(endpoint)
                        .set("X-Forwarded-For", "192.168.2.100"),
                globalLimit
            );
            const otherIp = await supertest(app)
                .get(endpoint)
                .set("X-Forwarded-For", "192.168.2.101");
            expect(otherIp.status).not.toBe(429);
        });
    });

    describe("Public read rate limiting", () => {
        it("returns 429 on public CMS GETs via the dedicated public read limiter", async () => {
            const limited = await untilRateLimited(
                () =>
                    supertest(app)
                        .get(`${apiPrefix}/company/information`)
                        .set("X-Forwarded-For", "203.0.113.80"),
                publicReadLimit
            );
            expect(limited.status).toBe(429);
        });

        it("does not consume the global anonymous bucket for public CMS GETs", async () => {
            const ip = "203.0.113.81";
            await untilRateLimited(
                () =>
                    supertest(app)
                        .get(`${apiPrefix}/company/information`)
                        .set("X-Forwarded-For", ip),
                publicReadLimit
            );
            const globalProbe = await supertest(app)
                .get(`${apiPrefix}/users/me`)
                .set("X-Forwarded-For", ip);
            expect(globalProbe.status).not.toBe(429);
        });
    });

    describe("Session rate limiting", () => {
        const makeJwt = (sub: string): string => {
            const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
                "base64url"
            );
            const body = Buffer.from(
                JSON.stringify({
                    sub,
                    exp: Math.floor(Date.now() / 1000) + 3600,
                })
            ).toString("base64url");
            return `${header}.${body}.signature`;
        };

        it("keys authenticated traffic by JWT sub instead of the global IP bucket", async () => {
            const token = makeJwt("660e8400-e29b-41d4-a716-446655440001");
            const limited = await untilRateLimited(
                () =>
                    supertest(app)
                        .get(`${apiPrefix}/auth/status`)
                        .set("Authorization", `Bearer ${token}`)
                        .set("X-Forwarded-For", "192.168.3.100"),
                sessionLimit
            );
            expect(limited.status).toBe(429);

            const otherIpSameToken = await supertest(app)
                .get(`${apiPrefix}/auth/status`)
                .set("Authorization", `Bearer ${token}`)
                .set("X-Forwarded-For", "192.168.3.101");
            expect(otherIpSameToken.status).toBe(429);
        });

        it("does not consume the global anonymous bucket when a JWT is present", async () => {
            const token = makeJwt("770e8400-e29b-41d4-a716-446655440002");
            await untilRateLimited(
                () =>
                    supertest(app)
                        .get(`${apiPrefix}/auth/status`)
                        .set("Authorization", `Bearer ${token}`)
                        .set("X-Forwarded-For", "192.168.3.200"),
                sessionLimit
            );
            const anonymousProbe = await supertest(app)
                .get(`${apiPrefix}/users/me`)
                .set("X-Forwarded-For", "192.168.3.200");
            expect(anonymousProbe.status).not.toBe(429);
        });
    });

    describe("Auth rate limiting", () => {
        it("returns 429 on sign-in when exceeded", async () => {
            const limited = await untilRateLimited(
                () =>
                    supertest(app)
                        .post(`${apiPrefix}/auth/sign-in`)
                        .set("X-Forwarded-For", "192.168.1.200")
                        .send({ email: "test@example.com", password: "wrong" }),
                authLimit
            );
            expect(limited.status).toBe(429);
        });
    });

    describe("Public API rate limiting", () => {
        const endpoint = `${apiPrefix}/public/integrations`;

        it("returns 429 per opo_ token when exceeded", async () => {
            const token = "opo_rate_limit_test_token_alpha";
            const limited = await untilRateLimited(
                () =>
                    supertest(app)
                        .get(endpoint)
                        .set("Authorization", `Bearer ${token}`)
                        .set("X-Forwarded-For", "192.168.4.100"),
                publicApiLimit
            );
            expect(limited.status).toBe(429);
        });

        it("isolates public API limits by token", async () => {
            const tokenA = "opo_rate_limit_test_token_beta";
            const tokenB = "opo_rate_limit_test_token_gamma";
            await untilRateLimited(
                () =>
                    supertest(app)
                        .get(endpoint)
                        .set("Authorization", `Bearer ${tokenA}`)
                        .set("X-Forwarded-For", "192.168.4.200"),
                publicApiLimit
            );
            const tokenBRes = await supertest(app)
                .get(endpoint)
                .set("Authorization", `Bearer ${tokenB}`)
                .set("X-Forwarded-For", "192.168.4.200");
            expect(tokenBRes.status).not.toBe(429);
        });
    });

    describe("MCP rate limiting", () => {
        it("returns 429 on POST /mcp with Bearer token when exceeded", async () => {
            const token = "opo_mcp_rate_limit_bearer_alpha";
            const limited = await untilRateLimited(
                () =>
                    supertest(app)
                        .post("/mcp")
                        .set("Authorization", `Bearer ${token}`)
                        .set("X-Forwarded-For", "192.168.6.100"),
                mcpLimit
            );
            expect(limited.status).toBe(429);
        });

        it("returns 429 on POST /mcp/:token when exceeded", async () => {
            const token = "opo_mcp_rate_limit_path_alpha";
            const limited = await untilRateLimited(
                () =>
                    supertest(app)
                        .post(`/mcp/${token}`)
                        .set("X-Forwarded-For", "192.168.6.110"),
                mcpLimit
            );
            expect(limited.status).toBe(429);
        });

        it("isolates MCP limits by token", async () => {
            const tokenA = "opo_mcp_rate_limit_token_beta";
            const tokenB = "opo_mcp_rate_limit_token_gamma";
            await untilRateLimited(
                () =>
                    supertest(app)
                        .post("/mcp")
                        .set("Authorization", `Bearer ${tokenA}`)
                        .set("X-Forwarded-For", "192.168.6.200"),
                mcpLimit
            );
            const tokenBRes = await supertest(app)
                .post("/mcp")
                .set("Authorization", `Bearer ${tokenB}`)
                .set("X-Forwarded-For", "192.168.6.200");
            expect(tokenBRes.status).not.toBe(429);
        });
    });

    describe("Feedback rate limiting", () => {
        it("returns 429 on POST /feedback when exceeded", async () => {
            const limited = await untilRateLimited(
                () =>
                    supertest(app)
                        .post(`${apiPrefix}/feedback`)
                        .set("X-Forwarded-For", "192.168.5.100")
                        .send({
                            feedback_type: "feedback",
                            url: "https://example.com/rate-limit",
                            description: "rate limit integration test message",
                            email: "ratelimit@example.com",
                        }),
                feedbackLimit
            );
            expect(limited.status).toBe(429);
        });
    });
});
