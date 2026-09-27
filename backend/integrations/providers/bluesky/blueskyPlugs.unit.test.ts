import { describe, expect, it, jest, afterEach } from "@jest/globals";
import type { IntegrationRecord } from "../../social.integrations.interface";
import { serializeBlueskyToken } from "./blueskyCredentials";
import {
    BLUESKY_GLOBAL_PLUG_CATALOG,
    fetchBlueskyPostLikeCount,
    runBlueskyAutoPlugPost,
    runBlueskyAutoRepostPlug,
} from "./blueskyPlugs";

const STORED_TOKEN = serializeBlueskyToken({
    service: "https://bsky.social",
    identifier: "alice.bsky.social",
    password: "app-password",
});

const POST_URI = "at://did:plc:abc/app.bsky.feed.post/xyz";

describe("BLUESKY_GLOBAL_PLUG_CATALOG", () => {
    it("exposes auto repost and auto plug entries", () => {
        expect(BLUESKY_GLOBAL_PLUG_CATALOG.map((p) => p.methodName)).toEqual(
            expect.arrayContaining(["autoRepostPost", "autoPlugPost"])
        );
        expect(BLUESKY_GLOBAL_PLUG_CATALOG.map((p) => p.identifier)).toEqual(
            expect.arrayContaining(["bluesky-auto-repost", "bluesky-auto-plug"])
        );
    });
});

describe("fetchBlueskyPostLikeCount", () => {
    it("reads likeCount from App View getPosts", async () => {
        const getPosts = jest
            .fn<() => Promise<{ data: { posts: { likeCount: number }[] } }>>()
            .mockResolvedValue({
            data: { posts: [{ likeCount: 42 }] },
        });
        const likes = await fetchBlueskyPostLikeCount(POST_URI, {
            createAppViewAgent: () => ({ getPosts }) as never,
        });
        expect(likes).toBe(42);
        expect(getPosts).toHaveBeenCalledWith({ uris: [POST_URI] });
    });
});

describe("runBlueskyAutoRepostPlug", () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it("returns false when likes are below threshold", async () => {
        const integration = { token: STORED_TOKEN } as IntegrationRecord;
        const out = await runBlueskyAutoRepostPlug(integration, POST_URI, { likesAmount: "100" }, {
            createAppViewAgent: () =>
                ({
                    getPosts: jest
                        .fn<() => Promise<{ data: { posts: { likeCount: number }[] } }>>()
                        .mockResolvedValue({ data: { posts: [{ likeCount: 10 }] } }),
                }) as never,
        });
        expect(out).toBe(false);
    });

    it("reposts when likes meet threshold", async () => {
        jest.useFakeTimers();
        const repost = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
        const integration = { token: STORED_TOKEN } as IntegrationRecord;

        const getPosts = jest
            .fn<() => Promise<{ data: { posts: { uri: string; cid: string }[] } }>>()
            .mockResolvedValue({
                data: { posts: [{ uri: POST_URI, cid: "bafyrei" }] },
            });

        const createAgent = () =>
            ({
                getPosts,
                login: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
                repost,
            }) as never;

        const outPromise = runBlueskyAutoRepostPlug(integration, POST_URI, { likesAmount: "50" }, {
            createAppViewAgent: () =>
                ({
                    getPosts: jest
                        .fn<() => Promise<{ data: { posts: { likeCount: number }[] } }>>()
                        .mockResolvedValue({ data: { posts: [{ likeCount: 50 }] } }),
                }) as never,
            createAgent,
        });
        await jest.runAllTimersAsync();
        const out = await outPromise;

        expect(out).toBe(true);
        expect(repost).toHaveBeenCalledWith(POST_URI, "bafyrei");
    });
});

describe("runBlueskyAutoPlugPost", () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it("returns false when reply text is too short", async () => {
        jest.useFakeTimers();
        const publishReply = jest.fn<
            (message: string, rootUri: string, parentUri: string) => Promise<void>
        >();
        const integration = { token: STORED_TOKEN } as IntegrationRecord;
        const outPromise = runBlueskyAutoPlugPost(
            integration,
            POST_URI,
            { likesAmount: "1", post: "ab" },
            publishReply,
            {
                createAppViewAgent: () =>
                    ({
                        getPosts: jest
                            .fn<() => Promise<{ data: { posts: { likeCount: number }[] } }>>()
                            .mockResolvedValue({ data: { posts: [{ likeCount: 5 }] } }),
                    }) as never,
            }
        );
        await jest.runAllTimersAsync();
        const out = await outPromise;
        expect(out).toBe(false);
        expect(publishReply).not.toHaveBeenCalled();
    });

    it("publishes a reply when threshold is met", async () => {
        jest.useFakeTimers();
        const publishReply = jest
            .fn<(message: string, rootUri: string, parentUri: string) => Promise<void>>()
            .mockResolvedValue(undefined);
        const integration = { token: STORED_TOKEN } as IntegrationRecord;
        const outPromise = runBlueskyAutoPlugPost(
            integration,
            POST_URI,
            { likesAmount: "10", post: "Thanks for reading!" },
            publishReply,
            {
                createAppViewAgent: () =>
                    ({
                        getPosts: jest
                            .fn<() => Promise<{ data: { posts: { likeCount: number }[] } }>>()
                            .mockResolvedValue({ data: { posts: [{ likeCount: 12 }] } }),
                    }) as never,
            }
        );
        await jest.runAllTimersAsync();
        const out = await outPromise;
        expect(out).toBe(true);
        expect(publishReply).toHaveBeenCalledWith("Thanks for reading!", POST_URI, POST_URI);
    });
});
