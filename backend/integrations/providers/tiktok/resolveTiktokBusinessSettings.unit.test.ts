import { resolveTiktokBusinessSettings } from "./resolveTiktokBusinessSettings.js";

describe("resolveTiktokBusinessSettings", () => {
    it("reads shared TikTok keys from flat providerSettings", () => {
        expect(
            resolveTiktokBusinessSettings(
                {
                    providerSettings: {
                        privacy_level: "SELF_ONLY",
                        content_posting_method: "UPLOAD",
                        disable_duet: true,
                    },
                },
                "Caption"
            )
        ).toMatchObject({
            privacy_level: "SELF_ONLY",
            content_posting_method: "UPLOAD",
            duet: false,
        });
    });

    it("reads Business-only keys from the tiktok-business bucket", () => {
        expect(
            resolveTiktokBusinessSettings({
                providerSettings: {
                    tiktok: {
                        privacy_level: "PUBLIC_TO_EVERYONE",
                    },
                    "tiktok-business": {
                        music_sound_id: "sound-99",
                        music_sound_volume: 70,
                        poi_id: "poi-42",
                    },
                },
            })
        ).toMatchObject({
            privacy_level: "PUBLIC_TO_EVERYONE",
            musicSoundInfo: {
                music_sound_id: "sound-99",
                music_sound_volume: 70,
            },
            poiId: "poi-42",
        });
    });

    it("reads flat Business music keys from providerSettings", () => {
        expect(
            resolveTiktokBusinessSettings({
                providerSettings: {
                    musicSoundId: "sound-flat",
                },
            })
        ).toMatchObject({
            musicSoundInfo: { music_sound_id: "sound-flat" },
        });
    });
});
