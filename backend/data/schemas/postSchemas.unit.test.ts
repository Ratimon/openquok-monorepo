import { createPostBodySchema } from "./postSchemas";

describe("createPostBodySchema media items", () => {
    const base = {
        organizationId: "c1d8a3f4-1234-4abc-bf12-1234567890ab",
        scheduledAt: "2026-05-14T10:00:00.000Z",
        status: "draft" as const,
    };

    it("accepts media with optional alt, thumbnail, and thumbnailTimestamp", () => {
        const result = createPostBodySchema.safeParse({
            ...base,
            media: [
                {
                    id: "media-1",
                    path: "social_media/org/reel.mp4",
                    alt: "Product reel",
                    thumbnail: "social_media/org/poster.jpg",
                    thumbnailTimestamp: 1.25,
                },
            ],
        });
        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.media).toEqual([
            {
                id: "media-1",
                path: "social_media/org/reel.mp4",
                alt: "Product reel",
                thumbnail: "social_media/org/poster.jpg",
                thumbnailTimestamp: 1.25,
            },
        ]);
    });

    it("rejects alt longer than 2000 characters", () => {
        const result = createPostBodySchema.safeParse({
            ...base,
            media: [{ id: "m1", path: "social_media/org/a.png", alt: "x".repeat(2001) }],
        });
        expect(result.success).toBe(false);
    });

    it("rejects negative thumbnailTimestamp", () => {
        const result = createPostBodySchema.safeParse({
            ...base,
            media: [{ id: "m1", path: "social_media/org/v.mp4", thumbnailTimestamp: -1 }],
        });
        expect(result.success).toBe(false);
    });
});
