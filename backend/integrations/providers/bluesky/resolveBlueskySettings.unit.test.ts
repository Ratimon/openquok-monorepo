import {
    isBlueskyQuoteTarget,
    parseBlueskyAppPostUrl,
    resolveBlueskySettings,
    validateBlueskySettingsForMedia,
} from "./resolveBlueskySettings.js";

describe("resolveBlueskySettings", () => {
    it("reads nested web composer bucket", () => {
        expect(
            resolveBlueskySettings({
                providerSettings: {
                    bluesky: {
                        linkUrl: "https://example.com",
                        linkTitle: "Example",
                        threadGate: "followers",
                    },
                },
            })
        ).toEqual({
            linkUrl: "https://example.com",
            linkTitle: "Example",
            threadGate: "followers",
        });
    });

    it("reads flat CLI keys on providerSettings", () => {
        expect(
            resolveBlueskySettings({
                providerSettings: {
                    quoteUrl: "https://bsky.app/profile/alice.bsky.social/post/abc",
                    thread_gate: "nobody",
                },
            })
        ).toEqual({
            quoteUrl: "https://bsky.app/profile/alice.bsky.social/post/abc",
            threadGate: "nobody",
        });
    });

    it("defaults thread gate to everyone", () => {
        expect(resolveBlueskySettings(null)).toEqual({ threadGate: "everyone" });
    });
});

describe("parseBlueskyAppPostUrl", () => {
    it("parses profile post URLs", () => {
        expect(
            parseBlueskyAppPostUrl("https://bsky.app/profile/alice.bsky.social/post/3jzabc")
        ).toEqual({
            actor: "alice.bsky.social",
            rkey: "3jzabc",
        });
    });
});

describe("validateBlueskySettingsForMedia", () => {
    it("rejects link cards with media", () => {
        expect(
            validateBlueskySettingsForMedia(
                { linkUrl: "https://example.com", threadGate: "everyone" },
                [{ path: "a.jpg" }]
            )
        ).toMatch(/link cards/i);
    });

    it("rejects quote with media", () => {
        expect(
            validateBlueskySettingsForMedia(
                {
                    quoteUrl: "at://did:plc:alice/app.bsky.feed.post/abc",
                    threadGate: "everyone",
                },
                [{ path: "clip.mp4" }]
            )
        ).toMatch(/quote/i);
    });

    it("rejects link and quote together", () => {
        expect(
            validateBlueskySettingsForMedia(
                {
                    linkUrl: "https://example.com",
                    quoteUrl: "https://bsky.app/profile/a/post/b",
                    threadGate: "everyone",
                },
                []
            )
        ).toMatch(/both/i);
    });
});

describe("isBlueskyQuoteTarget", () => {
    it("accepts AT URIs and bsky.app links", () => {
        expect(isBlueskyQuoteTarget("at://did:plc:x/app.bsky.feed.post/y")).toBe(true);
        expect(isBlueskyQuoteTarget("https://bsky.app/profile/x/post/y")).toBe(true);
        expect(isBlueskyQuoteTarget("https://example.com")).toBe(false);
    });
});
