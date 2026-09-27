import {
    BLUESKY_MAX_IMAGES,
    BLUESKY_MAX_VIDEO_BYTES,
    classifyBlueskyMedia,
    extractBlueskyMediaFromSettings,
    validateBlueskyMediaMix,
    validateBlueskyVideoByteSize,
} from "./blueskyMedia.js";

describe("blueskyMedia", () => {
    it("reads media.items from settings", () => {
        const items = extractBlueskyMediaFromSettings({
            media: { items: [{ path: "social/a.jpg" }, { path: "social/b.png" }] },
        });
        expect(items).toHaveLength(2);
    });

    it("allows up to four images", () => {
        const media = Array.from({ length: BLUESKY_MAX_IMAGES }, (_, i) => ({ path: `a${i}.jpg` }));
        expect(classifyBlueskyMedia(media)).toBe("images");
        expect(validateBlueskyMediaMix(media)).toBeNull();
    });

    it("rejects two videos", () => {
        const media = [{ path: "a.mp4" }, { path: "b.mp4" }];
        expect(classifyBlueskyMedia(media)).toBe("empty");
        expect(validateBlueskyMediaMix(media)).toMatch(/one MP4/);
    });

    it("rejects mixed image and video", () => {
        const media = [{ path: "a.mp4" }, { path: "b.jpg" }];
        expect(validateBlueskyMediaMix(media)).toMatch(/mixing/);
    });

    it("allows text-only (empty media)", () => {
        expect(classifyBlueskyMedia([])).toBe("empty");
        expect(validateBlueskyMediaMix([])).toBeNull();
    });

    it("rejects videos over 300 MB", () => {
        expect(validateBlueskyVideoByteSize(BLUESKY_MAX_VIDEO_BYTES)).toBeNull();
        expect(validateBlueskyVideoByteSize(BLUESKY_MAX_VIDEO_BYTES + 1)).toMatch(/300 MB/);
    });
});
