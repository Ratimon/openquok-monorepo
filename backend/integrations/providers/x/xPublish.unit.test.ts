import { parseXCommunityIdFromUrl, resolveXSettings, buildTweetPayload, buildTweetText } from "./xPublish.js";

describe("resolveXSettings", () => {
    it("reads flat CLI keys", () => {
        expect(
            resolveXSettings({
                who_can_reply_post: "following",
                made_with_ai: true,
            })
        ).toEqual({
            who_can_reply: "following",
            made_with_ai: true,
        });
    });

    it("reads nested web bucket providerSettings.x", () => {
        expect(
            resolveXSettings({
                providerSettings: {
                    x: {
                        whoCanReplyPost: "mentionedUsers",
                        community: "https://x.com/i/communities/123456789",
                        paidPartnership: true,
                    },
                },
            })
        ).toEqual({
            who_can_reply: "mentionedUsers",
            community_id: "123456789",
            paid_partnership: true,
        });
    });

    it("prefers nested x bucket over flat providerSettings keys", () => {
        expect(
            resolveXSettings({
                providerSettings: {
                    who_can_reply_post: "following",
                    x: { whoCanReplyPost: "verified" },
                },
            })
        ).toEqual({ who_can_reply: "verified" });
    });
});

describe("parseXCommunityIdFromUrl", () => {
    it("parses community URLs", () => {
        expect(parseXCommunityIdFromUrl("https://x.com/i/communities/987654321")).toBe("987654321");
    });

    it("accepts raw numeric ids", () => {
        expect(parseXCommunityIdFromUrl("555")).toBe("555");
    });
});

describe("buildTweetPayload", () => {
    it("maps reply settings, community, and disclosure labels", () => {
        const payload = buildTweetPayload(
            "Hello world",
            {
                who_can_reply: "following",
                community_id: "42",
                made_with_ai: true,
                paid_partnership: true,
            },
            ["media-1"],
            "root-tweet"
        );

        expect(payload.text).toBe("Hello world");
        expect(payload.reply_settings).toBe("following");
        expect(payload.community_id).toBe("42");
        expect(payload.media).toEqual({ media_ids: ["media-1"] });
        expect(payload.reply).toEqual({ in_reply_to_tweet_id: "root-tweet" });
        expect((payload as Record<string, unknown>).content_disclosure).toEqual({
            made_with_ai: true,
            paid_partnership: true,
        });
    });
});

describe("buildTweetText", () => {
    it("strips HTML to plain text", () => {
        expect(buildTweetText("<p>Hello <strong>world</strong></p>", {})).toBe("Hello world");
    });
});
