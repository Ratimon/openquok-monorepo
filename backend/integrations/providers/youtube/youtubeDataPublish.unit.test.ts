import {
    extractYoutubeMediaFromSettings,
    shouldSkipYoutubeThumbnail,
    validateYoutubeTitle,
    validateYoutubeVideoMedia,
    YOUTUBE_THUMBNAIL_MAX_BYTES,
} from "./youtubePublishValidation.js";

describe("extractYoutubeMediaFromSettings", () => {
    it("reads media.items worker shape", () => {
        expect(
            extractYoutubeMediaFromSettings({
                media: { items: [{ path: "composer-media/video.mp4" }] },
            })
        ).toEqual([{ path: "composer-media/video.mp4" }]);
    });

    it("returns empty when media is missing", () => {
        expect(extractYoutubeMediaFromSettings({})).toEqual([]);
        expect(extractYoutubeMediaFromSettings(null)).toEqual([]);
    });
});

describe("validateYoutubeVideoMedia", () => {
    it("accepts exactly one mp4", () => {
        expect(() => validateYoutubeVideoMedia([{ path: "a/b.mp4" }])).not.toThrow();
    });

    it("rejects zero or multiple attachments", () => {
        expect(() => validateYoutubeVideoMedia([])).toThrow("YouTube requires one video attachment");
        expect(() => validateYoutubeVideoMedia([{ path: "a.mp4" }, { path: "b.mp4" }])).toThrow(
            "YouTube requires one video attachment"
        );
    });

    it("rejects non-mp4 extensions", () => {
        expect(() => validateYoutubeVideoMedia([{ path: "a.mov" }])).toThrow(
            "YouTube requires an MP4 video attachment"
        );
    });
});

describe("validateYoutubeTitle", () => {
    it("enforces 2–100 character title", () => {
        expect(() => validateYoutubeTitle("a")).toThrow("at least 2 characters");
        expect(() => validateYoutubeTitle("ab")).not.toThrow();
        expect(() => validateYoutubeTitle("x".repeat(101))).toThrow("at most 100 characters");
    });
});

describe("shouldSkipYoutubeThumbnail", () => {
    it("skips when larger than YouTube 2 MiB limit", () => {
        expect(shouldSkipYoutubeThumbnail(YOUTUBE_THUMBNAIL_MAX_BYTES + 1)).toBe(true);
        expect(shouldSkipYoutubeThumbnail(YOUTUBE_THUMBNAIL_MAX_BYTES)).toBe(false);
        expect(shouldSkipYoutubeThumbnail(1024)).toBe(false);
    });

    it("does not skip when size is unknown", () => {
        expect(shouldSkipYoutubeThumbnail(null)).toBe(false);
        expect(shouldSkipYoutubeThumbnail(undefined)).toBe(false);
    });
});
