import type { Request } from "express";

import {
    isAuthExemptRoute,
    isPublicReadGet,
    isPublicWriteRoute,
    normalizeApiRoutePath,
} from "./publicRouteRegistry";

const asReq = (partial: Partial<Request>): Request => partial as Request;

describe("publicRouteRegistry", () => {
    describe("isAuthExemptRoute", () => {
        it("exempts prefix trees such as /auth and /company", () => {
            expect(isAuthExemptRoute(asReq({ method: "GET" }), "/auth/status")).toBe(true);
            expect(isAuthExemptRoute(asReq({ method: "GET" }), "/company/information")).toBe(true);
            expect(isAuthExemptRoute(asReq({ method: "POST" }), "/feedback/submit")).toBe(true);
        });

        it("exempts exact public index paths", () => {
            expect(isAuthExemptRoute(asReq({ method: "GET" }), "/blog-system/rss")).toBe(true);
            expect(isAuthExemptRoute(asReq({ method: "GET" }), "/listings/published")).toBe(true);
            expect(isAuthExemptRoute(asReq({ method: "GET" }), "/listings/creators")).toBe(true);
        });

        it("exempts blog posts by slug on GET only", () => {
            expect(
                isAuthExemptRoute(
                    asReq({ method: "GET" }),
                    "/blog-system/posts/how-to-edit-video"
                )
            ).toBe(true);
            expect(
                isAuthExemptRoute(asReq({ method: "PUT" }), "/blog-system/posts/how-to-edit-video")
            ).toBe(false);
            expect(isAuthExemptRoute(asReq({ method: "GET" }), "/blog-system/drafts")).toBe(false);
        });

        it("exempts public image download only with allowlisted query params", () => {
            expect(
                isAuthExemptRoute(
                    asReq({
                        method: "GET",
                        query: {
                            databaseName: "blog_images",
                            imageUrl: "https://cdn.example.com/a.webp",
                        },
                    }),
                    "/image/download"
                )
            ).toBe(true);
            expect(
                isAuthExemptRoute(asReq({ method: "GET", query: {} }), "/image/download")
            ).toBe(false);
            expect(
                isAuthExemptRoute(
                    asReq({
                        method: "GET",
                        query: { databaseName: "other", imageUrl: "https://cdn.example.com/a.webp" },
                    }),
                    "/image/download"
                )
            ).toBe(false);
        });

        it("exempts integration connect POST routes", () => {
            expect(
                isAuthExemptRoute(
                    asReq({ method: "POST" }),
                    "/integrations/social-connect/abc123"
                )
            ).toBe(true);
            expect(
                isAuthExemptRoute(
                    asReq({ method: "POST" }),
                    "/integrations/public/provider/x/connect"
                )
            ).toBe(true);
        });

        it("exempts listing stat PUT routes", () => {
            expect(
                isAuthExemptRoute(
                    asReq({ method: "PUT" }),
                    "/listings/stats/views/550e8400-e29b-41d4-a716-446655440000"
                )
            ).toBe(true);
        });

        it("requires auth for protected dashboard routes", () => {
            expect(isAuthExemptRoute(asReq({ method: "GET" }), "/users/me")).toBe(false);
            expect(isAuthExemptRoute(asReq({ method: "GET" }), "/posts")).toBe(false);
        });
    });

    describe("isPublicReadGet", () => {
        it("includes auth-exempt GET routes", () => {
            const authExemptGets: Array<{ path: string; req?: Partial<Request> }> = [
                { path: "/company/information" },
                { path: "/blog-system/rss" },
                { path: "/blog-system/posts/how-to-edit-video" },
                { path: "/listings/published" },
                { path: "/listings/stacks/published/my-stack" },
                { path: "/listings/categories/active-partial" },
                { path: "/listings/tags/all-full" },
                { path: "/listings/creators/openquok" },
                { path: "/auth/status" },
                { path: "/integrations" },
                {
                    path: "/image/download",
                    req: {
                        query: {
                            databaseName: "listing_images",
                            imageUrl: "https://cdn.example.com/b.webp",
                        },
                    },
                },
            ];

            for (const { path, req } of authExemptGets) {
                const request = asReq({ method: "GET", ...req });
                expect(isPublicReadGet(request, path)).toBe(true);
                expect(isAuthExemptRoute(request, path)).toBe(true);
            }
        });

        it("excludes non-GET auth-exempt routes", () => {
            expect(
                isPublicReadGet(
                    asReq({ method: "PUT" }),
                    "/listings/stats/likes/550e8400-e29b-41d4-a716-446655440000"
                )
            ).toBe(false);
            expect(
                isPublicReadGet(
                    asReq({ method: "POST" }),
                    "/integrations/social-connect/abc123"
                )
            ).toBe(false);
            expect(
                isAuthExemptRoute(
                    asReq({ method: "PUT" }),
                    "/listings/stats/likes/550e8400-e29b-41d4-a716-446655440000"
                )
            ).toBe(true);
        });

        it("does not treat unguarded image download as a public read", () => {
            expect(isPublicReadGet(asReq({ method: "GET", query: {} }), "/image/download")).toBe(
                false
            );
        });
    });

    describe("isPublicWriteRoute", () => {
        it("matches anonymous write routes used by the public write limiter", () => {
            expect(isPublicWriteRoute(asReq({ method: "POST" }), "/company/t")).toBe(true);
            expect(
                isPublicWriteRoute(
                    asReq({ method: "PUT" }),
                    "/blog-system/posts/my-post/activity"
                )
            ).toBe(true);
            expect(
                isPublicWriteRoute(
                    asReq({ method: "PUT" }),
                    "/listings/stats/clicks/550e8400-e29b-41d4-a716-446655440000"
                )
            ).toBe(true);
        });

        it("does not match read routes", () => {
            expect(isPublicWriteRoute(asReq({ method: "GET" }), "/company/information")).toBe(false);
        });
    });

    describe("normalizeApiRoutePath", () => {
        it("strips the API prefix and trailing slashes", () => {
            expect(normalizeApiRoutePath("/api/v1/company/information", "/api/v1")).toBe(
                "/company/information"
            );
            expect(normalizeApiRoutePath("/api/v1/company/information/", "/api/v1")).toBe(
                "/company/information"
            );
        });
    });
});
