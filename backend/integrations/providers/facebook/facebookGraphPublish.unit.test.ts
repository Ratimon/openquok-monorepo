import { resolveFacebookLinkFromSettings } from "./facebookGraphPublish.js";

describe("resolveFacebookLinkFromSettings", () => {
    it("reads flat url from providerSettings (CLI/API)", () => {
        expect(
            resolveFacebookLinkFromSettings({
                providerSettings: { url: "https://example.com/article" },
            })
        ).toBe("https://example.com/article");
    });

    it("reads nested facebook.url from providerSettings (web composer)", () => {
        expect(
            resolveFacebookLinkFromSettings({
                providerSettings: {
                    facebook: { url: "https://example.com/page" },
                },
            })
        ).toBe("https://example.com/page");
    });

    it("prefers flat providerSettings url over nested facebook bucket", () => {
        expect(
            resolveFacebookLinkFromSettings({
                providerSettings: {
                    url: "https://flat.example",
                    facebook: { url: "https://nested.example" },
                },
            })
        ).toBe("https://flat.example");
    });

    it("returns undefined when no url is set", () => {
        expect(resolveFacebookLinkFromSettings({ providerSettings: {} })).toBeUndefined();
        expect(resolveFacebookLinkFromSettings(null)).toBeUndefined();
    });
});
