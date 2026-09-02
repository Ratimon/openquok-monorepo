import {
    buildTiktokBusinessPhotoBody,
    buildTiktokBusinessVideoBody,
    resolveTiktokBusinessVideoCover,
} from "./tiktokBusinessPublish.js";
import type { TiktokBusinessResolvedPublishSettings } from "./resolveTiktokBusinessSettings.js";

const baseSettings: TiktokBusinessResolvedPublishSettings = {
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

describe("resolveTiktokBusinessVideoCover", () => {
    it("prefers a custom thumbnail URL over a timestamp", () => {
        expect(
            resolveTiktokBusinessVideoCover([
                {
                    path: "social_media/org/video.mp4",
                    thumbnail: "https://cdn.example.com/cover.jpg",
                    thumbnailTimestamp: 1500,
                },
            ])
        ).toEqual({
            customThumbnailUrl: "https://cdn.example.com/cover.jpg",
        });
    });

    it("falls back to thumbnail offset when no thumbnail URL is set", () => {
        expect(
            resolveTiktokBusinessVideoCover([
                {
                    path: "social_media/org/video.mp4",
                    thumbnailTimestamp: 1500,
                },
            ])
        ).toEqual({
            thumbnailOffsetMs: 1500,
        });
    });

    it("returns an empty cover when neither thumbnail nor timestamp is set", () => {
        expect(resolveTiktokBusinessVideoCover([{ path: "social_media/org/video.mp4" }])).toEqual({});
    });
});

describe("buildTiktokBusinessVideoBody", () => {
    it("maps custom_thumbnail_url and omits thumbnail_offset when a poster URL is present", () => {
        const body = buildTiktokBusinessVideoBody({
            businessId: "biz-1",
            videoUrl: "https://cdn.example.com/v.mp4",
            caption: "Hello #fyp",
            settings: baseSettings,
            cover: { customThumbnailUrl: "https://cdn.example.com/cover.jpg" },
        });

        expect(body).toMatchObject({
            business_id: "biz-1",
            video_url: "https://cdn.example.com/v.mp4",
            custom_thumbnail_url: "https://cdn.example.com/cover.jpg",
            post_info: {
                caption: "Hello #fyp",
                disable_duet: false,
                disable_stitch: true,
                disable_comment: false,
                is_brand_organic: true,
                is_branded_content: false,
                is_ai_generated: false,
            },
        });
        expect((body.post_info as Record<string, unknown>).thumbnail_offset).toBeUndefined();
        expect((body.post_info as Record<string, unknown>).privacy_level).toBeUndefined();
    });

    it("maps thumbnail_offset when only a timestamp cover is available", () => {
        const body = buildTiktokBusinessVideoBody({
            businessId: "biz-1",
            videoUrl: "https://cdn.example.com/v.mp4",
            caption: "caption",
            settings: baseSettings,
            cover: { thumbnailOffsetMs: 2500 },
        });

        expect(body.custom_thumbnail_url).toBeUndefined();
        expect(body.post_info).toMatchObject({
            thumbnail_offset: "2500",
        });
    });

    it("sets upload_to_draft for inbox upload and skips direct-post extras", () => {
        const uploadSettings: TiktokBusinessResolvedPublishSettings = {
            ...baseSettings,
            content_posting_method: "UPLOAD",
            musicSoundInfo: { music_sound_id: "sound-1" },
        };

        const body = buildTiktokBusinessVideoBody({
            businessId: "biz-1",
            videoUrl: "https://cdn.example.com/v.mp4",
            caption: "caption",
            settings: uploadSettings,
        });

        expect(body.post_info).toMatchObject({
            upload_to_draft: true,
        });
        expect((body.post_info as Record<string, unknown>).music_sound_info).toBeUndefined();
        expect((body.post_info as Record<string, unknown>).poi_id).toBeUndefined();
    });

    it("includes music and location on DIRECT_POST video bodies", () => {
        const body = buildTiktokBusinessVideoBody({
            businessId: "biz-1",
            videoUrl: "https://cdn.example.com/v.mp4",
            caption: "caption",
            settings: {
                ...baseSettings,
                musicSoundInfo: { music_sound_id: "sound-1", music_sound_volume: 80 },
                poiId: "poi-123",
            },
        });

        expect(body.post_info).toMatchObject({
            music_sound_info: { music_sound_id: "sound-1", music_sound_volume: 80 },
            poi_id: "poi-123",
        });
    });
});

describe("buildTiktokBusinessPhotoBody", () => {
    it("includes privacy and cover index for direct photo posts", () => {
        expect(
            buildTiktokBusinessPhotoBody({
                businessId: "biz-1",
                photoUrls: ["https://cdn.example.com/1.jpg", "https://cdn.example.com/2.jpg"],
                caption: "carousel",
                settings: baseSettings,
            })
        ).toMatchObject({
            business_id: "biz-1",
            photo_cover_index: 0,
            photo_images: ["https://cdn.example.com/1.jpg", "https://cdn.example.com/2.jpg"],
            post_info: {
                title: "Photo title",
                caption: "carousel",
                privacy_level: "PUBLIC_TO_EVERYONE",
                auto_add_music: true,
            },
        });
    });

    it("sets is_draft for inbox photo upload", () => {
        const body = buildTiktokBusinessPhotoBody({
            businessId: "biz-1",
            photoUrls: ["https://cdn.example.com/1.jpg"],
            caption: "carousel",
            settings: { ...baseSettings, content_posting_method: "UPLOAD" },
        });

        expect(body.post_info).toMatchObject({ is_draft: true });
        expect((body.post_info as Record<string, unknown>).privacy_level).toBeUndefined();
    });
});
