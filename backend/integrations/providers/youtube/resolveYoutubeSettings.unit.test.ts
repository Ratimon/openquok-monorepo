import { resolveYoutubeSettings } from "./resolveYoutubeSettings.js";

describe("resolveYoutubeSettings", () => {
    it("reads flat providerSettings keys (CLI/API)", () => {
        expect(
            resolveYoutubeSettings(
                {
                    providerSettings: {
                        title: "CLI title",
                        type: "unlisted",
                        selfDeclaredMadeForKids: "yes",
                        tags: ["one", "two"],
                    },
                },
                "Post body"
            )
        ).toEqual({
            title: "CLI title",
            description: "Post body",
            privacyStatus: "unlisted",
            selfDeclaredMadeForKids: true,
            tags: ["one", "two"],
            thumbnailPath: undefined,
        });
    });

    it("reads nested youtube bucket from providerSettings (web composer)", () => {
        expect(
            resolveYoutubeSettings({
                providerSettings: {
                    youtube: {
                        title: "Web title",
                        type: "private",
                        selfDeclaredMadeForKids: "no",
                        tags: [{ value: "tag1", label: "tag1" }],
                        thumbnail: { path: "composer-media/thumb.jpg" },
                    },
                },
            })
        ).toEqual({
            title: "Web title",
            description: "",
            privacyStatus: "private",
            selfDeclaredMadeForKids: false,
            tags: ["tag1"],
            thumbnailPath: "composer-media/thumb.jpg",
        });
    });

    it("merges flat keys then applies nested youtube bucket overrides", () => {
        expect(
            resolveYoutubeSettings({
                providerSettings: {
                    title: "Flat title",
                    type: "public",
                    youtube: {
                        title: "Nested title",
                        type: "unlisted",
                    },
                },
            })
        ).toMatchObject({
            title: "Nested title",
            privacyStatus: "unlisted",
        });
    });

    it("returns defaults when settings are empty", () => {
        expect(resolveYoutubeSettings(null, "desc")).toEqual({
            title: "",
            description: "desc",
            privacyStatus: "public",
            selfDeclaredMadeForKids: false,
            tags: [],
        });
    });
});
