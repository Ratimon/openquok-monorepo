import type { Request } from "express";

import { clientIpFromRequest, isPublicCachedGetRequest } from "./rateLimit";

const asReq = (partial: Partial<Request>): Request => partial as Request;

describe("rateLimit helpers", () => {
    describe("clientIpFromRequest", () => {
        it("prefers CF-Connecting-IP over req.ip", () => {
            expect(
                clientIpFromRequest(
                    asReq({
                        ip: "104.23.160.155",
                        headers: { "cf-connecting-ip": "203.0.113.10" },
                    })
                )
            ).toBe("203.0.113.10");
        });

        it("falls back to req.ip", () => {
            expect(
                clientIpFromRequest(
                    asReq({
                        ip: "192.0.2.8",
                        headers: {},
                    })
                )
            ).toBe("192.0.2.8");
        });
    });

    describe("isPublicCachedGetRequest", () => {
        it("skips public CMS and catalog GETs used by website SSR", () => {
            expect(isPublicCachedGetRequest(asReq({ method: "GET", path: "/company/information" }))).toBe(true);
            expect(
                isPublicCachedGetRequest(
                    asReq({ method: "GET", path: "/blog-system/posts/how-to-edit-video" })
                )
            ).toBe(true);
            expect(isPublicCachedGetRequest(asReq({ method: "GET", path: "/listings/published" }))).toBe(true);
            expect(isPublicCachedGetRequest(asReq({ method: "GET", path: "/image/download" }))).toBe(true);
        });

        it("does not skip writes or authenticated-style session paths", () => {
            expect(isPublicCachedGetRequest(asReq({ method: "PUT", path: "/company/information" }))).toBe(
                false
            );
            expect(isPublicCachedGetRequest(asReq({ method: "GET", path: "/auth/status" }))).toBe(false);
            expect(isPublicCachedGetRequest(asReq({ method: "GET", path: "/users/me" }))).toBe(false);
        });
    });
});
