import supertest from "supertest";
import { app } from "../../app";
import { config } from "../../config/GlobalConfig";

/**
 * Rate limit integration tests. Requires RATE_LIMIT_ENABLED=true.
 * Simplified: shared helpers, grouped assertions, consistent structure.
 */
describe("Rate limit", () => {
    const originalRateLimitEnabled = process.env.RATE_LIMIT_ENABLED;

    beforeAll(() => {
        process.env.RATE_LIMIT_ENABLED = "true";
    });

    afterAll(() => {
        if (originalRateLimitEnabled !== undefined) {
            process.env.RATE_LIMIT_ENABLED = originalRateLimitEnabled;
        } else {
            delete process.env.RATE_LIMIT_ENABLED;
        }
    });

    const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
    const globalLimit = (config.rateLimit as { global?: { max?: number } })?.global?.max ?? 30;
    const authLimit = (config.rateLimit as { auth?: { max?: number } })?.auth?.max ?? 50;

    /** Make requests until over limit; returns all responses. */
    async function makeRequestsUntilLimit(
        requestFn: () => supertest.Test,
        limit: number,
        extra = 5
    ): Promise<supertest.Response[]> {
        const out: supertest.Response[] = [];
        for (let i = 0; i < limit + extra; i++) {
            out.push(await requestFn());
        }
        return out;
    }

    describe("Global rate limiting", () => {
        const endpoint = `${apiPrefix}/auth/status`;

        it("allows requests within limit; returns 429 with body when exceeded", async () => {
            const safe = Math.min(10, Math.max(1, globalLimit - 10));
            for (let i = 0; i < safe; i++) {
                const res = await supertest(app).get(endpoint).set("X-Forwarded-For", "192.168.1.10");
                expect(res.status).toBe(200);
            }

            const responses = await makeRequestsUntilLimit(
                () => supertest(app).get(endpoint).set("X-Forwarded-For", "192.168.1.100"),
                globalLimit
            );
            const rateLimited = responses.filter((r) => r.status === 429);
            expect(rateLimited.length).toBeGreaterThan(0);
            const first = rateLimited[0];
            expect(first?.body?.status).toBe("error");
            expect(first?.body?.message).toContain("Too many requests");
            expect(first?.body?.retryAfter).toBeDefined();
            expect(typeof first?.body?.retryAfter).toBe("number");
            expect(first?.body?.retryAfter).toBeGreaterThan(0);
        });
    });

    describe("Auth rate limiting", () => {
        it("applies auth limit to sign-in; returns 429 when exceeded", async () => {
            const responses = await makeRequestsUntilLimit(
                () =>
                    supertest(app)
                        .post(`${apiPrefix}/auth/sign-in`)
                        .set("X-Forwarded-For", "192.168.1.200")
                        .send({ email: "test@example.com", password: "wrong" }),
                authLimit
            );
            const rateLimited = responses.filter((r) => r.status === 429);
            expect(rateLimited.length).toBeGreaterThan(0);
            expect(rateLimited[0]?.status).toBe(429);
        });
    });

    describe("Isolation and response format", () => {
        const endpoint = `${apiPrefix}/auth/status`;

        it("isolates limits by IP; new IP is not rate limited", async () => {
            const ip1Responses = await makeRequestsUntilLimit(
                () => supertest(app).get(endpoint).set("X-Forwarded-For", "192.168.2.100"),
                globalLimit
            );
            expect(ip1Responses.some((r) => r.status === 429)).toBe(true);

            const ip2Res = await supertest(app).get(endpoint).set("X-Forwarded-For", "192.168.2.101");
            expect(ip2Res.status).not.toBe(429);
        });

        it("429 response has status, message, retryAfter within window", async () => {
            const responses = await makeRequestsUntilLimit(
                () => supertest(app).get(endpoint).set("X-Forwarded-For", "192.168.3.100"),
                globalLimit
            );
            const r = responses.find((x) => x.status === 429);
            expect(r).toBeDefined();
            expect(r?.body).toMatchObject({
                status: "error",
                message: expect.stringContaining("Too many"),
            });
            expect(typeof r?.body?.retryAfter).toBe("number");
            expect(r?.body?.retryAfter).toBeGreaterThan(0);
            const windowMs = (config.rateLimit as { global?: { windowMs?: number } })?.global?.windowMs ?? 3600000;
            expect(r?.body?.retryAfter).toBeLessThanOrEqual(Math.ceil(windowMs / 1000));
        });
    });

    describe("Configuration", () => {
        it("has rate limit enabled flag and global/auth limiters with required props", () => {
            expect(config.rateLimit).toBeDefined();
            expect((config.rateLimit as { enabled?: boolean }).enabled).toBeDefined();

            const rl = config.rateLimit as { global?: Record<string, unknown>; auth?: Record<string, unknown> };
            expect(rl.global).toBeDefined();
            expect(rl.auth).toBeDefined();
            const required = ["windowMs", "max", "standardHeaders", "legacyHeaders"];
            [rl.global, rl.auth].forEach((limiter) => {
                required.forEach((prop) => expect(limiter).toHaveProperty(prop));
            });
        });
    });
});
