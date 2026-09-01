import {
    extractFollowUpRepliesFromPostSettingsColumn,
    extractFollowUpRepliesFromProviderSettingsObject,
    isFacebookStoryProviderSettings,
    replyChainBucketForProvider,
} from "./PostDTO";

describe("PostDTO follow-up buckets", () => {
    describe("replyChainBucketForProvider", () => {
        it.each([
            ["threads", "threads"],
            ["x", "x"],
            ["instagram", "instagram"],
            ["instagram-standalone", "instagram"],
            ["linkedin", "linkedin"],
            ["linkedin-page", "linkedin"],
            ["facebook", "facebook"],
            ["unknown-provider", "threads"],
        ] as const)("maps %s to %s bucket", (provider, bucket) => {
            expect(replyChainBucketForProvider(provider)).toBe(bucket);
        });

        it("defaults nullish and blank identifiers to threads", () => {
            expect(replyChainBucketForProvider(null)).toBe("threads");
            expect(replyChainBucketForProvider(undefined)).toBe("threads");
            expect(replyChainBucketForProvider("")).toBe("threads");
            expect(replyChainBucketForProvider("   ")).toBe("threads");
        });

        it("normalizes casing and surrounding whitespace", () => {
            expect(replyChainBucketForProvider("  LinkedIn-Page  ")).toBe("linkedin");
            expect(replyChainBucketForProvider("FACEBOOK")).toBe("facebook");
            expect(replyChainBucketForProvider(" Instagram ")).toBe("instagram");
        });
    });

    describe("extractFollowUpRepliesFromProviderSettingsObject", () => {
        it("reads linkedin.replies for linkedin-page", () => {
            const replies = extractFollowUpRepliesFromProviderSettingsObject(
                {
                    linkedin: {
                        replies: [{ id: "li1", message: "Great point", delaySeconds: 3 }],
                    },
                },
                "linkedin-page"
            );
            expect(replies).toEqual([{ id: "li1", message: "Great point", delaySeconds: 3 }]);
        });

        it("reads linkedin.replies for linkedin (not linkedin-page)", () => {
            const replies = extractFollowUpRepliesFromProviderSettingsObject(
                {
                    linkedin: {
                        replies: [{ id: "li2", message: "Second thought", delaySeconds: 5 }],
                    },
                },
                "linkedin"
            );
            expect(replies).toEqual([{ id: "li2", message: "Second thought", delaySeconds: 5 }]);
        });

        it("reads facebook.replies for Facebook channels", () => {
            const replies = extractFollowUpRepliesFromProviderSettingsObject(
                {
                    facebook: {
                        replies: [{ id: "fb1", message: "Follow-up", delaySeconds: 0 }],
                    },
                },
                "facebook"
            );
            expect(replies).toEqual([{ id: "fb1", message: "Follow-up", delaySeconds: 0 }]);
        });

        it("does not read replies from a different bucket", () => {
            const providerSettings = {
                linkedin: { replies: [{ id: "li1", message: "LinkedIn only", delaySeconds: 1 }] },
                facebook: { replies: [{ id: "fb1", message: "Facebook only", delaySeconds: 2 }] },
            };
            expect(
                extractFollowUpRepliesFromProviderSettingsObject(providerSettings, "facebook")
            ).toEqual([{ id: "fb1", message: "Facebook only", delaySeconds: 2 }]);
            expect(
                extractFollowUpRepliesFromProviderSettingsObject(providerSettings, "linkedin-page")
            ).toEqual([{ id: "li1", message: "LinkedIn only", delaySeconds: 1 }]);
        });

        it.each([
            ["threads", "threads"],
            ["x", "x"],
            ["instagram", "instagram"],
            ["instagram", "instagram-standalone"],
        ] as const)("reads %s.replies for %s provider", (bucket, provider) => {
            const replies = extractFollowUpRepliesFromProviderSettingsObject(
                {
                    [bucket]: {
                        replies: [{ id: "r1", message: "Chain reply", delaySeconds: 10 }],
                    },
                },
                provider
            );
            expect(replies).toEqual([{ id: "r1", message: "Chain reply", delaySeconds: 10 }]);
        });

        it("returns empty array for missing or invalid providerSettings", () => {
            expect(extractFollowUpRepliesFromProviderSettingsObject(null, "linkedin")).toEqual([]);
            expect(extractFollowUpRepliesFromProviderSettingsObject(undefined, "facebook")).toEqual(
                []
            );
            expect(
                extractFollowUpRepliesFromProviderSettingsObject({ linkedin: null }, "linkedin")
            ).toEqual([]);
            expect(
                extractFollowUpRepliesFromProviderSettingsObject({ linkedin: [] }, "linkedin")
            ).toEqual([]);
            expect(
                extractFollowUpRepliesFromProviderSettingsObject({ linkedin: {} }, "linkedin")
            ).toEqual([]);
        });

        it("filters invalid drafts and normalizes delaySeconds", () => {
            const replies = extractFollowUpRepliesFromProviderSettingsObject(
                {
                    facebook: {
                        replies: [
                            { id: "", message: "no id" },
                            { id: "fb2", message: "  trimmed  ", delaySeconds: 2.9 },
                            { id: "fb3", message: "" },
                            { id: "fb4", message: "valid", delaySeconds: -3 },
                            { id: "fb5", message: "bad delay", delaySeconds: "nope" },
                        ],
                    },
                },
                "facebook"
            );
            expect(replies).toEqual([
                { id: "fb2", message: "trimmed", delaySeconds: 2 },
                { id: "fb4", message: "valid", delaySeconds: 0 },
                { id: "fb5", message: "bad delay", delaySeconds: 0 },
            ]);
        });

        it("parses flat media[] on follow-up replies", () => {
            const replies = extractFollowUpRepliesFromProviderSettingsObject(
                {
                    threads: {
                        replies: [
                            {
                                id: "t1",
                                message: "With image",
                                delaySeconds: 1,
                                media: [
                                    { id: "m1", path: "social_media/org/img.jpg" },
                                    { id: "", path: "social_media/org/skip.jpg" },
                                ],
                            },
                        ],
                    },
                },
                "threads"
            );
            expect(replies).toEqual([
                {
                    id: "t1",
                    message: "With image",
                    delaySeconds: 1,
                    media: [{ id: "m1", path: "social_media/org/img.jpg" }],
                },
            ]);
        });

        it("parses media.items wrapper on follow-up replies", () => {
            const replies = extractFollowUpRepliesFromProviderSettingsObject(
                {
                    facebook: {
                        replies: [
                            {
                                id: "fb1",
                                message: "Carousel",
                                delaySeconds: 0,
                                media: {
                                    items: [{ id: "m2", path: "social_media/org/photo.png" }],
                                },
                            },
                        ],
                    },
                },
                "facebook"
            );
            expect(replies).toEqual([
                {
                    id: "fb1",
                    message: "Carousel",
                    delaySeconds: 0,
                    media: [{ id: "m2", path: "social_media/org/photo.png" }],
                },
            ]);
        });

        it("omits media when missing or invalid on follow-up replies", () => {
            const replies = extractFollowUpRepliesFromProviderSettingsObject(
                {
                    x: {
                        replies: [
                            { id: "x1", message: "Text only", delaySeconds: 0 },
                            { id: "x2", message: "Bad media", delaySeconds: 1, media: { items: "nope" } },
                        ],
                    },
                },
                "x"
            );
            expect(replies).toEqual([
                { id: "x1", message: "Text only", delaySeconds: 0 },
                { id: "x2", message: "Bad media", delaySeconds: 1 },
            ]);
        });
    });

    describe("extractFollowUpRepliesFromPostSettingsColumn", () => {
        it("parses linkedin and facebook replies from posts.settings JSON", () => {
            const settings = JSON.stringify({
                providerSettings: {
                    linkedin: {
                        replies: [{ id: "li1", message: "From column", delaySeconds: 4 }],
                    },
                    facebook: {
                        replies: [{ id: "fb1", message: "Also from column", delaySeconds: 1 }],
                    },
                },
            });

            expect(extractFollowUpRepliesFromPostSettingsColumn(settings, "linkedin")).toEqual([
                { id: "li1", message: "From column", delaySeconds: 4 },
            ]);
            expect(extractFollowUpRepliesFromPostSettingsColumn(settings, "facebook")).toEqual([
                { id: "fb1", message: "Also from column", delaySeconds: 1 },
            ]);
        });

        it("returns empty array for blank or invalid settings JSON", () => {
            expect(extractFollowUpRepliesFromPostSettingsColumn(null, "linkedin")).toEqual([]);
            expect(extractFollowUpRepliesFromPostSettingsColumn("", "facebook")).toEqual([]);
            expect(extractFollowUpRepliesFromPostSettingsColumn("{not json", "linkedin")).toEqual(
                []
            );
            expect(
                extractFollowUpRepliesFromPostSettingsColumn(
                    JSON.stringify({ isGlobal: true }),
                    "linkedin"
                )
            ).toEqual([]);
        });
    });

    describe("isFacebookStoryProviderSettings", () => {
        it("detects facebook.postType story", () => {
            expect(
                isFacebookStoryProviderSettings({
                    facebook: { postType: "story" },
                })
            ).toBe(true);
        });

        it("detects flat post_type story keys", () => {
            expect(isFacebookStoryProviderSettings({ post_type: "story" })).toBe(true);
        });

        it("returns false for feed posts and missing settings", () => {
            expect(isFacebookStoryProviderSettings({ facebook: { postType: "post" } })).toBe(false);
            expect(isFacebookStoryProviderSettings(null)).toBe(false);
        });
    });
});
