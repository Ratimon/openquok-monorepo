import type { Request, Response } from "express";

import {
    applyPublicCmsCacheHeadersForRequest,
    buildCacheControlHeader,
    resolvePublicCmsCacheControl,
} from "../utils/http/publicCmsCache";

jest.mock("../config/GlobalConfig", () => ({
    config: {
        publicCmsCache: {
            enabled: true,
            maxAgeSeconds: 60,
            staleWhileRevalidateSeconds: 300,
            rssMaxAgeSeconds: 86400,
            imageMaxAgeSeconds: 3600,
            imageStaleWhileRevalidateSeconds: 86400,
        },
    },
}));

const asReq = (partial: Partial<Request>): Request => partial as Request;

const mockRes = (): Response => {
    const headers: Record<string, string> = {};
    return {
        getHeader: (name: string) => headers[name.toLowerCase()],
        setHeader: (name: string, value: string) => {
            headers[name.toLowerCase()] = value;
        },
    } as Response;
};

describe("publicCmsCache", () => {
    describe("buildCacheControlHeader", () => {
        it("includes stale-while-revalidate when provided", () => {
            expect(buildCacheControlHeader(60, 300)).toBe(
                "public, max-age=60, stale-while-revalidate=300"
            );
        });
    });

    describe("resolvePublicCmsCacheControl", () => {
        it("returns default CMS cache for company information", () => {
            expect(
                resolvePublicCmsCacheControl(
                    asReq({ method: "GET" }),
                    "/company/information"
                )
            ).toBe("public, max-age=60, stale-while-revalidate=300");
        });

        it("returns longer cache for RSS", () => {
            expect(
                resolvePublicCmsCacheControl(asReq({ method: "GET" }), "/blog-system/rss")
            ).toBe("public, max-age=86400");
        });

        it("returns image cache for public blog image downloads", () => {
            expect(
                resolvePublicCmsCacheControl(
                    asReq({
                        method: "GET",
                        query: {
                            databaseName: "blog_images",
                            imageUrl: "posts/hero.webp",
                        },
                    }),
                    "/image/download"
                )
            ).toBe("public, max-age=3600, stale-while-revalidate=86400");
        });

        it("returns null for non-public routes", () => {
            expect(
                resolvePublicCmsCacheControl(asReq({ method: "GET" }), "/users/me")
            ).toBeNull();
        });
    });

    describe("applyPublicCmsCacheHeadersForRequest", () => {
        it("does not overwrite an existing Cache-Control header", () => {
            const res = mockRes();
            res.setHeader("Cache-Control", "private, max-age=0");
            applyPublicCmsCacheHeadersForRequest(
                asReq({ method: "GET" }),
                res,
                "/company/information"
            );
            expect(res.getHeader("Cache-Control")).toBe("private, max-age=0");
        });
    });
});
