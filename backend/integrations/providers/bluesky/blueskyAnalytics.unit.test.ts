/** Jest/ts-jest needs ~4.2GB heap for this file; use `pnpm test:unit:bluesky-analytics` or `NODE_OPTIONS=--max-old-space-size=8192`. */
import type { BlueskyPostEngagementSnapshot } from "./blueskyAnalyticsCore.js";
import {
    fetchBlueskyAccountAnalytics,
    fetchBlueskyPostAnalytics,
    mapBlueskyPostBucketsToAnalytics,
    mapBlueskyPostViewToAnalytics,
} from "./blueskyAnalyticsCore.js";

function postView(overrides: Partial<BlueskyPostEngagementSnapshot> = {}): BlueskyPostEngagementSnapshot {
    return {
        indexedAt: "2026-09-20T12:00:00.000Z",
        likeCount: 3,
        replyCount: 1,
        repostCount: 2,
        quoteCount: 0,
        ...overrides,
    };
}

describe("mapBlueskyPostBucketsToAnalytics", () => {
    it("maps dated buckets into chart rows", () => {
        expect(
            mapBlueskyPostBucketsToAnalytics({
                "2026-09-19": { likes: 4, replies: 1, reposts: 2, quotes: 0 },
                "2026-09-20": { likes: 6, replies: 0, reposts: 1, quotes: 1 },
            })
        ).toEqual([
            {
                label: "Likes",
                percentageChange: 0,
                data: [
                    { date: "2026-09-19", total: "4" },
                    { date: "2026-09-20", total: "6" },
                ],
            },
            {
                label: "Replies",
                percentageChange: 0,
                data: [
                    { date: "2026-09-19", total: "1" },
                    { date: "2026-09-20", total: "0" },
                ],
            },
            {
                label: "Reposts",
                percentageChange: 0,
                data: [
                    { date: "2026-09-19", total: "2" },
                    { date: "2026-09-20", total: "1" },
                ],
            },
            {
                label: "Quotes",
                percentageChange: 0,
                data: [
                    { date: "2026-09-19", total: "0" },
                    { date: "2026-09-20", total: "1" },
                ],
            },
        ]);
    });

    it("returns empty when no buckets", () => {
        expect(mapBlueskyPostBucketsToAnalytics({})).toEqual([]);
    });
});

describe("mapBlueskyPostViewToAnalytics", () => {
    it("maps a single post view to metric rows", () => {
        expect(mapBlueskyPostViewToAnalytics(postView())).toEqual([
            { label: "Likes", percentageChange: 0, data: [{ total: "3", date: "2026-09-20" }] },
            { label: "Replies", percentageChange: 0, data: [{ total: "1", date: "2026-09-20" }] },
            { label: "Reposts", percentageChange: 0, data: [{ total: "2", date: "2026-09-20" }] },
            { label: "Quotes", percentageChange: 0, data: [{ total: "0", date: "2026-09-20" }] },
        ]);
    });
});

describe("fetchBlueskyAccountAnalytics", () => {
    it("aggregates author feed posts in the lookback window", async () => {
        const getAuthorFeed = jest.fn().mockResolvedValueOnce({
            data: {
                feed: [{ post: postView({ indexedAt: "2026-09-25T10:00:00.000Z", likeCount: 5 }) }],
                cursor: undefined,
            },
        });

        const out = await fetchBlueskyAccountAnalytics("did:plc:alice", "unused-token", 7, {
            createAgent: () =>
                ({
                    app: { bsky: { feed: { getAuthorFeed } } },
                    login: jest.fn(),
                    getPosts: jest.fn(),
                }) as never,
        });

        expect(getAuthorFeed).toHaveBeenCalledWith(
            expect.objectContaining({ actor: "did:plc:alice", limit: 100 })
        );
        expect(out.some((row) => row.label === "Likes" && row.data[0]?.total === "5")).toBe(true);
    });
});

describe("fetchBlueskyPostAnalytics", () => {
    it("reads engagement from getPosts", async () => {
        const uri = "at://did:plc:alice/app.bsky.feed.post/abc";
        const getPosts = jest.fn().mockResolvedValue({
            data: { posts: [postView({ quoteCount: 4 })] },
        });

        const out = await fetchBlueskyPostAnalytics(uri, {
            createAgent: () =>
                ({
                    getPosts,
                    login: jest.fn(),
                    app: { bsky: { feed: { getAuthorFeed: jest.fn() } } },
                }) as never,
        });

        expect(getPosts).toHaveBeenCalledWith({ uris: [uri] });
        expect(out.find((row) => row.label === "Quotes")?.data[0]?.total).toBe("4");
    });

    it("throws when release id is not an AT URI", async () => {
        await expect(
            fetchBlueskyPostAnalytics("not-a-uri", {
                createAgent: () => ({}) as never,
            })
        ).rejects.toThrow(/URI/);
    });
});
