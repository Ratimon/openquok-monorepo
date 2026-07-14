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
        auth?: { max?: number };
        publicApi?: { max?: number };
        upload?: Record<string, unknown>;
        feedback?: { max?: number };
    };

    const globalLimit = rl.global?.max ?? 3;
    const authLimit = rl.auth?.max ?? 3;
    const publicApiLimit = rl.publicApi?.max ?? 3;
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
        expect(authLimit).toBeLessThanOrEqual(5);
        expect(publicApiLimit).toBeLessThanOrEqual(5);
        expect(feedbackLimit).toBeLessThanOrEqual(5);
        expect(rl.global).toMatchObject({
            windowMs: expect.any(Number),
            max: expect.any(Number),
            standardHeaders: true,
            legacyHeaders: false,
        });
        expect(rl.auth).toBeDefined();
        expect(rl.publicApi).toBeDefined();
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
