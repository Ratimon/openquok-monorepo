import {
    classifyTiktokMedia,
    extractTiktokMediaFromSettings,
    resolveTiktokVideoCoverTimestampMs,
    validateTiktokMedia,
} from "./tiktokPublishValidation.js";

describe("extractTiktokMediaFromSettings", () => {
    it("reads media.items worker shape", () => {
        expect(
            extractTiktokMediaFromSettings({
                media: { items: [{ path: "composer-media/video.mp4" }] },
            })
        ).toEqual([{ path: "composer-media/video.mp4" }]);
    });

    it("preserves thumbnailTimestamp on media items", () => {
        expect(
            extractTiktokMediaFromSettings({
                media: {
                    items: [
                        {
                            path: "composer-media/video.mp4",
                            thumbnailTimestamp: 3.5,
                        },
                    ],
                },
            })
        ).toEqual([
            {
                path: "composer-media/video.mp4",
                thumbnailTimestamp: 3.5,
            },
        ]);
    });

    it("preserves thumbnail path on media items", () => {
        expect(
            extractTiktokMediaFromSettings({
                media: {
                    items: [
                        {
                            path: "composer-media/video.mp4",
                            thumbnail: "composer-media/video-cover.jpg",
                        },
                    ],
                },
            })
        ).toEqual([
            {
                path: "composer-media/video.mp4",
                thumbnail: "composer-media/video-cover.jpg",
            },
        ]);
    });

    it("preserves both thumbnail and thumbnailTimestamp", () => {
        expect(
            extractTiktokMediaFromSettings({
                media: [
                    {
                        path: "composer-media/video.mp4",
                        thumbnail: "composer-media/video-cover.jpg",
                        thumbnailTimestamp: 1.25,
                    },
                ],
            })
        ).toEqual([
            {
                path: "composer-media/video.mp4",
                thumbnail: "composer-media/video-cover.jpg",
                thumbnailTimestamp: 1.25,
            },
        ]);
    });

    it("stores null thumbnailTimestamp when explicitly null", () => {
        expect(
            extractTiktokMediaFromSettings({
                media: { items: [{ path: "composer-media/video.mp4", thumbnailTimestamp: null }] },
            })
        ).toEqual([{ path: "composer-media/video.mp4", thumbnailTimestamp: null }]);
    });

    it("drops invalid thumbnailTimestamp values", () => {
        expect(
            extractTiktokMediaFromSettings({
                media: {
                    items: [
                        { path: "a.mp4", thumbnailTimestamp: -1 },
                        { path: "b.mp4", thumbnailTimestamp: Number.NaN },
                        { path: "c.mp4", thumbnailTimestamp: Number.POSITIVE_INFINITY },
                        { path: "d.mp4", thumbnailTimestamp: "3" },
                    ],
                },
            })
        ).toEqual([{ path: "a.mp4" }, { path: "b.mp4" }, { path: "c.mp4" }, { path: "d.mp4" }]);
    });

    it("normalizes empty thumbnail to null", () => {
        expect(
            extractTiktokMediaFromSettings({
                media: { items: [{ path: "composer-media/video.mp4", thumbnail: "   " }] },
            })
        ).toEqual([{ path: "composer-media/video.mp4", thumbnail: null }]);
    });
});

describe("resolveTiktokVideoCoverTimestampMs", () => {
    it("returns rounded ms from the first video item", () => {
        expect(
            resolveTiktokVideoCoverTimestampMs([{ path: "a.mp4", thumbnailTimestamp: 3.5 }])
        ).toBe(4);
    });

    it("returns zero when the first item timestamp is 0", () => {
        expect(resolveTiktokVideoCoverTimestampMs([{ path: "a.mp4", thumbnailTimestamp: 0 }])).toBe(0);
    });

    it("omits when thumbnailTimestamp is unset", () => {
        expect(resolveTiktokVideoCoverTimestampMs([{ path: "a.mp4" }])).toBeUndefined();
    });

    it("omits when thumbnailTimestamp is null", () => {
        expect(
            resolveTiktokVideoCoverTimestampMs([{ path: "a.mp4", thumbnailTimestamp: null }])
        ).toBeUndefined();
    });

    it("omits when media is empty", () => {
        expect(resolveTiktokVideoCoverTimestampMs([])).toBeUndefined();
    });

    it("omits when thumbnailTimestamp is negative", () => {
        expect(
            resolveTiktokVideoCoverTimestampMs([{ path: "a.mp4", thumbnailTimestamp: -0.5 }])
        ).toBeUndefined();
    });

    it("omits when thumbnailTimestamp is not finite", () => {
        expect(
            resolveTiktokVideoCoverTimestampMs([{ path: "a.mp4", thumbnailTimestamp: Number.NaN }])
        ).toBeUndefined();
    });

    it("uses only the first item timestamp", () => {
        expect(
            resolveTiktokVideoCoverTimestampMs([
                { path: "a.mp4", thumbnailTimestamp: 2.4 },
                { path: "b.mp4", thumbnailTimestamp: 9.9 },
            ])
        ).toBe(2);
    });
});

describe("classifyTiktokMedia", () => {
    it("detects single mp4 as video", () => {
        expect(classifyTiktokMedia([{ path: "a/b.mp4" }])).toBe("video");
    });

    it("detects images as photo", () => {
        expect(classifyTiktokMedia([{ path: "a.jpg" }, { path: "b.png" }])).toBe("photo");
    });

    it("rejects mixed video and images", () => {
        expect(classifyTiktokMedia([{ path: "a.mp4" }, { path: "b.jpg" }])).toBeNull();
    });
});

describe("validateTiktokMedia", () => {
    it("accepts one mp4 video", () => {
        const result = validateTiktokMedia([{ path: "https://cdn.example.com/video.mp4" }]);
        expect(result.kind).toBe("video");
        expect(result.urls).toEqual(["https://cdn.example.com/video.mp4"]);
    });

    it("rejects empty media", () => {
        expect(() => validateTiktokMedia([])).toThrow("requires one video or one or more images");
    });

    it("rejects multiple videos", () => {
        expect(() => validateTiktokMedia([{ path: "a.mp4" }, { path: "b.mp4" }])).toThrow(
            "does not support mixing video and images"
        );
    });
});
