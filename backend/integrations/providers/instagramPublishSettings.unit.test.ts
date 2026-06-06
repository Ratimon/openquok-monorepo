import {
    normalizeInstagramCollaborators,
    resolveInstagramPublishSettings,
} from "./instagramPublishSettings.js";

describe("resolveInstagramPublishSettings", () => {
    it("reads flat API keys from providerSettings", () => {
        expect(
            resolveInstagramPublishSettings({
                isGlobal: true,
                providerSettings: {
                    post_type: "story",
                    is_trial_reel: true,
                    graduation_strategy: "SS_PERFORMANCE",
                    collaborators: [{ label: "openquok" }],
                },
            })
        ).toEqual({
            post_type: "story",
            is_trial_reel: true,
            graduation_strategy: "SS_PERFORMANCE",
            collaborators: [{ label: "openquok" }],
        });
    });

    it("reads web composer nested instagram bucket", () => {
        expect(
            resolveInstagramPublishSettings({
                providerSettings: {
                    instagram: {
                        postType: "story",
                        trialReel: false,
                        graduationStrategy: "MANUAL",
                        collaborators: ["creator_one", "@creator_two"],
                    },
                },
            })
        ).toEqual({
            post_type: "story",
            is_trial_reel: false,
            graduation_strategy: "MANUAL",
            collaborators: [{ label: "creator_one" }, { label: "creator_two" }],
        });
    });

    it("prefers nested instagram bucket over flat providerSettings keys", () => {
        expect(
            resolveInstagramPublishSettings({
                providerSettings: {
                    post_type: "post",
                    instagram: { postType: "story" },
                },
            }).post_type
        ).toBe("story");
    });

    it("falls back to defaults when settings are empty", () => {
        expect(resolveInstagramPublishSettings(null)).toEqual({
            post_type: "post",
            is_trial_reel: false,
            graduation_strategy: "MANUAL",
            collaborators: [],
        });
    });
});

describe("normalizeInstagramCollaborators", () => {
    it("caps at three collaborators", () => {
        expect(
            normalizeInstagramCollaborators(["a", "b", "c", "d"]).map((c) => c.label)
        ).toEqual(["a", "b", "c"]);
    });

    it("parses comma-separated legacy string", () => {
        expect(normalizeInstagramCollaborators("one, @two")).toEqual([
            { label: "one" },
            { label: "two" },
        ]);
    });
});
