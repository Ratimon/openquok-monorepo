import {
    classifyTiktokMedia,
    extractTiktokMediaFromSettings,
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
