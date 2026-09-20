import type { Request } from "express";

import { isPublicReadGet } from "./publicRouteRegistry";
import {
    buildRateLimitExceededLog,
    isPublicCachedGetRequest,
    trustedClientIp,
    tryResolveUserIdFromRequest,
} from "./rateLimit";

jest.mock("../config/GlobalConfig", () => ({
    config: {
        server: {
            trustCloudflareHeaders: true,
            verifyCloudflareIpRange: false,
        },
        api: { prefix: "/api/v1" },
        rateLimit: {
            enabled: false,
            global: { windowMs: 3600000, max: 1000, standardHeaders: true, legacyHeaders: false },
            publicRead: { windowMs: 3600000, max: 600, standardHeaders: true, legacyHeaders: false },
            session: { windowMs: 3600000, max: 2000, standardHeaders: true, legacyHeaders: false },
            auth: { windowMs: 900000, max: 50, standardHeaders: true, legacyHeaders: false },
            oauth: { windowMs: 300000, max: 20, standardHeaders: true, legacyHeaders: false },
            publicApi: { windowMs: 3600000, max: 30, standardHeaders: true, legacyHeaders: false },
            mcp: { windowMs: 3600000, max: 120, standardHeaders: true, legacyHeaders: false },
            upload: { windowMs: 3600000, max: 20, standardHeaders: true, legacyHeaders: false },
            feedback: { windowMs: 3600000, max: 10, standardHeaders: true, legacyHeaders: false },
            integrationConnect: {
                windowMs: 900000,
                max: 30,
                standardHeaders: true,
                legacyHeaders: false,
            },
            oauthToken: { windowMs: 900000, max: 30, standardHeaders: true, legacyHeaders: false },
            publicWrite: { windowMs: 3600000, max: 60, standardHeaders: true, legacyHeaders: false },
        },
    },
}));

const asReq = (partial: Partial<Request>): Request => partial as Request;

const makeJwt = (payload: Record<string, unknown>): string => {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${header}.${body}.signature`;
};

describe("rateLimit helpers", () => {
    describe("trustedClientIp", () => {
        it("prefers CF-Connecting-IP over req.ip when Cloudflare headers are trusted", () => {
            expect(
                trustedClientIp(
                    asReq({
                        ip: "104.23.160.155",
                        headers: { "cf-connecting-ip": "203.0.113.10" },
                    })
                )
            ).toBe("203.0.113.10");
        });

        it("falls back to req.ip", () => {
            expect(
                trustedClientIp(
                    asReq({
                        ip: "192.0.2.8",
                        headers: {},
                    })
                )
            ).toBe("192.0.2.8");
        });
    });

    describe("tryResolveUserIdFromRequest", () => {
        const userId = "550e8400-e29b-41d4-a716-446655440000";

        it("returns req.user.id when already set", () => {
            expect(
                tryResolveUserIdFromRequest(
                    asReq({
                        user: { id: userId },
                    } as Partial<Request>)
                )
            ).toBe(userId);
        });

        it("peeks sub from a Bearer JWT without verifying the signature", () => {
            const token = makeJwt({
                sub: userId,
                exp: Math.floor(Date.now() / 1000) + 3600,
            });
            expect(
                tryResolveUserIdFromRequest(
                    asReq({
                        headers: { authorization: `Bearer ${token}` },
                    })
                )
            ).toBe(userId);
        });

        it("ignores expired JWT payloads", () => {
            const token = makeJwt({
                sub: userId,
                exp: Math.floor(Date.now() / 1000) - 60,
            });
            expect(
                tryResolveUserIdFromRequest(
                    asReq({
                        headers: { authorization: `Bearer ${token}` },
                    })
                )
            ).toBeNull();
        });

        it("ignores programmatic public API tokens", () => {
            expect(
                tryResolveUserIdFromRequest(
                    asReq({
                        headers: { authorization: "Bearer opo_test_token" },
                    })
                )
            ).toBeNull();
        });

        it("reads Bull Board cookie tokens", () => {
            const token = makeJwt({
                sub: userId,
                exp: Math.floor(Date.now() / 1000) + 3600,
            });
            expect(
                tryResolveUserIdFromRequest(
                    asReq({
                        headers: {},
                        cookies: { openquok_bullboard_jwt: token },
                    } as Partial<Request>)
                )
            ).toBe(userId);
        });
    });

    describe("buildRateLimitExceededLog", () => {
        const userId = "550e8400-e29b-41d4-a716-446655440000";

        it("includes limiter name, trusted client IP, path, window, and max", () => {
            const payload = buildRateLimitExceededLog(
                asReq({
                    method: "GET",
                    path: "/blog-system/posts/example",
                    ip: "104.23.160.155",
                    headers: { "cf-connecting-ip": "203.0.113.10" },
                }),
                "publicRead",
                { windowMs: 3600000, max: 600 }
            );

            expect(payload).toEqual({
                msg: "Rate limit exceeded",
                limiter: "publicRead",
                path: "/blog-system/posts/example",
                method: "GET",
                trustedClientIp: "203.0.113.10",
                userId: null,
                windowMs: 3600000,
                max: 600,
            });
        });

        it("includes userId when a session JWT is present", () => {
            const token = makeJwt({
                sub: userId,
                exp: Math.floor(Date.now() / 1000) + 3600,
            });
            const payload = buildRateLimitExceededLog(
                asReq({
                    method: "GET",
                    path: "/users/me",
                    headers: { authorization: `Bearer ${token}` },
                    ip: "192.0.2.8",
                }),
                "session",
                { windowMs: 3600000, max: 2000 }
            );

            expect(payload.limiter).toBe("session");
            expect(payload.userId).toBe(userId);
            expect(payload.trustedClientIp).toBe("192.0.2.8");
        });
    });

    describe("isPublicCachedGetRequest", () => {
        it("delegates to the public route registry for CMS and catalog GETs", () => {
            expect(isPublicCachedGetRequest(asReq({ method: "GET", path: "/company/information" }))).toBe(
                true
            );
            expect(
                isPublicCachedGetRequest(
                    asReq({ method: "GET", path: "/blog-system/posts/how-to-edit-video" })
                )
            ).toBe(true);
            expect(isPublicCachedGetRequest(asReq({ method: "GET", path: "/listings/published" }))).toBe(
                true
            );
            expect(
                isPublicCachedGetRequest(
                    asReq({
                        method: "GET",
                        path: "/image/download",
                        query: {
                            databaseName: "blog_images",
                            imageUrl: "https://cdn.example.com/a.webp",
                        },
                    })
                )
            ).toBe(true);
        });

        it("does not skip writes, unguarded downloads, or protected session paths", () => {
            expect(isPublicCachedGetRequest(asReq({ method: "PUT", path: "/company/information" }))).toBe(
                false
            );
            expect(isPublicCachedGetRequest(asReq({ method: "GET", path: "/image/download" }))).toBe(
                false
            );
            expect(isPublicCachedGetRequest(asReq({ method: "GET", path: "/users/me" }))).toBe(false);
        });

        it("matches isPublicReadGet for the request path", () => {
            const req = asReq({ method: "GET", path: "/blog-system/rss" });
            expect(isPublicCachedGetRequest(req)).toBe(isPublicReadGet(req, req.path));
        });
    });
});
