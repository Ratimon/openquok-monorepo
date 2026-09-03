import {
    buildTiktokPhotoPostInfoBody,
    buildTiktokPhotoSourceInfoBody,
    buildTiktokVideoPostInfoBody,
    buildTiktokVideoSourceInfoBody,
} from "./tiktokDataPublish.js";
import type { TiktokResolvedPublishSettings } from "./resolveTiktokSettings.js";

const baseSettings: TiktokResolvedPublishSettings = {
    privacy_level: "PUBLIC_TO_EVERYONE",
    content_posting_method: "DIRECT_POST",
    title: "Photo title",
    duet: true,
    stitch: false,
    comment: true,
    autoAddMusic: true,
    brand_content_toggle: false,
    brand_organic_toggle: true,
    video_made_with_ai: false,
};

describe("buildTiktokVideoPostInfoBody", () => {
    it("maps caption and toggles to TikTok video post_info", () => {
        expect(buildTiktokVideoPostInfoBody(baseSettings, "My caption #fyp")).toEqual({
            title: "My caption #fyp",
            privacy_level: "PUBLIC_TO_EVERYONE",
            disable_duet: false,
            disable_stitch: true,
            disable_comment: false,
            brand_content_toggle: false,
            brand_organic_toggle: true,
            is_aigc: false,
        });
    });
});

describe("buildTiktokPhotoPostInfoBody", () => {
    it("includes direct-post fields when directPost is true", () => {
        expect(buildTiktokPhotoPostInfoBody(baseSettings, "desc", true)).toMatchObject({
            title: "Photo title",
            description: "desc",
            privacy_level: "PUBLIC_TO_EVERYONE",
            disable_comment: false,
            auto_add_music: true,
        });
    });

    it("omits direct-post-only fields for inbox upload", () => {
        const body = buildTiktokPhotoPostInfoBody(baseSettings, "desc", false);
        expect(body).not.toHaveProperty("privacy_level");
        expect(body).not.toHaveProperty("auto_add_music");
    });
});

describe("buildTiktok source_info bodies", () => {
    it("builds PULL_FROM_URL video source", () => {
        expect(buildTiktokVideoSourceInfoBody("https://cdn.example.com/v.mp4")).toEqual({
            source: "PULL_FROM_URL",
            video_url: "https://cdn.example.com/v.mp4",
        });
    });

    it("builds PULL_FROM_URL photo carousel source", () => {
        expect(buildTiktokPhotoSourceInfoBody(["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"])).toEqual({
            source: "PULL_FROM_URL",
            photo_images: ["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"],
            photo_cover_index: 0,
        });
    });
});
