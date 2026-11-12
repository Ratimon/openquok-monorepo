import type { Request } from "express";

import {
    collapseVolatilePathSegments,
    httpPathTemplateForRequest,
} from "./httpPathTemplate";

describe("collapseVolatilePathSegments", () => {
    it("replaces UUID path segments", () => {
        expect(
            collapseVolatilePathSegments(
                "/listings/published/4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b"
            )
        ).toBe("/listings/published/:id");
    });
});

describe("httpPathTemplateForRequest", () => {
    it("includes databaseName for public image downloads", () => {
        const req = {
            method: "GET",
            query: { databaseName: "blog_images", imageUrl: "hero.webp" },
        } as unknown as Request;
        expect(httpPathTemplateForRequest(req, "/image/download")).toBe(
            "/image/download?databaseName=blog_images"
        );
    });

    it("collapses public API subpaths", () => {
        const req = { method: "GET", query: {} } as unknown as Request;
        expect(httpPathTemplateForRequest(req, "/public/posts/schedule")).toBe("/public/posts/:segment");
    });
});
