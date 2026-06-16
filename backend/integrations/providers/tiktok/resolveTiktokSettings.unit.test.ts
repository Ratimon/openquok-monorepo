import { resolveTiktokSettings } from "./resolveTiktokSettings.js";

describe("resolveTiktokSettings", () => {
    it("reads flat providerSettings keys (CLI/API)", () => {
        expect(
            resolveTiktokSettings(
                {
                    providerSettings: {
                        privacy_level: "MUTUAL_FOLLOW_FRIENDS",
                        content_posting_method: "UPLOAD",
                        title: "Photo title",
                        duet: false,
                        stitch: true,
                        comment: false,
                        auto_add_music: true,
                        brand_content_toggle: true,
                        video_made_with_ai: true,
                    },
                },
                "Caption text"
            )
        ).toEqual({
            privacy_level: "MUTUAL_FOLLOW_FRIENDS",
            content_posting_method: "UPLOAD",
            title: "Photo title",
            duet: false,
            stitch: true,
            comment: false,
            autoAddMusic: true,
            brand_content_toggle: true,
            brand_organic_toggle: false,
            video_made_with_ai: true,
        });
    });

    it("reads nested tiktok bucket from providerSettings (web composer)", () => {
        expect(
            resolveTiktokSettings({
                providerSettings: {
                    tiktok: {
                        privacy_level: "SELF_ONLY",
                        contentPostingMethod: "DIRECT_POST",
                        disable_duet: true,
                        brand_organic_toggle: true,
                    },
                },
            })
        ).toMatchObject({
            privacy_level: "SELF_ONLY",
            content_posting_method: "DIRECT_POST",
            duet: false,
            brand_organic_toggle: true,
        });
    });

    it("uses caption as title when title is omitted", () => {
        expect(resolveTiktokSettings({}, "Hello TikTok")).toMatchObject({
            title: "Hello TikTok",
        });
    });

    it("returns defaults when settings are empty", () => {
        expect(resolveTiktokSettings(null, "desc")).toEqual({
            privacy_level: "PUBLIC_TO_EVERYONE",
            content_posting_method: "DIRECT_POST",
            title: "desc",
            duet: true,
            stitch: true,
            comment: true,
            autoAddMusic: false,
            brand_content_toggle: false,
            brand_organic_toggle: false,
            video_made_with_ai: false,
        });
    });
});
