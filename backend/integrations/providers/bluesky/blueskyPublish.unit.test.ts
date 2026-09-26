import type { BskyAgent } from "@atproto/api";

import { serializeBlueskyToken } from "./blueskyCredentials.js";
import { blueskyReleaseUrl, publishBlueskyPost, publishBlueskyReply, searchBlueskyActors } from "./blueskyPublish.js";

const TOKEN = serializeBlueskyToken({
    service: "https://bsky.social",
    identifier: "alice.bsky.social",
    password: "app-password",
});

function mockAgent(overrides: Partial<BskyAgent> = {}): BskyAgent {
    const base = {
        login: jest.fn().mockResolvedValue(undefined),
        did: "did:plc:alice",
        post: jest.fn().mockResolvedValue({ uri: "at://did:plc:alice/app.bsky.feed.post/abc123", cid: "bafy" }),
        uploadBlob: jest.fn().mockResolvedValue({ data: { blob: { ref: { $link: "img" } } } }),
        getProfile: jest.fn().mockResolvedValue({ data: { handle: "alice.bsky.social" } }),
        getPosts: jest.fn().mockResolvedValue({
            data: {
                posts: [{ uri: "at://did:plc:alice/app.bsky.feed.post/root", cid: "bafyroot" }],
            },
        }),
        searchActors: jest.fn().mockResolvedValue({
            data: {
                actors: [
                    {
                        did: "did:plc:bob",
                        handle: "bob.bsky.social",
                        displayName: "Bob",
                        avatar: "https://cdn.example/avatar.jpg",
                    },
                ],
            },
        }),
        app: {
            bsky: {
                video: {
                    uploadVideo: jest.fn(),
                    getJobStatus: jest.fn(),
                },
            },
        },
    };
    return { ...base, ...overrides } as unknown as BskyAgent;
}

describe("blueskyPublish", () => {
    it("builds public post URLs", () => {
        expect(blueskyReleaseUrl("alice.bsky.social", "at://did:plc:alice/app.bsky.feed.post/abc123")).toBe(
            "https://bsky.app/profile/alice.bsky.social/post/abc123"
        );
    });

    it("publishes text-only posts", async () => {
        const agent = mockAgent();
        const res = await publishBlueskyPost(
            TOKEN,
            { id: "post-1", message: "Hello Bluesky", settings: {} },
            { createAgent: () => agent }
        );
        expect(agent.login).toHaveBeenCalled();
        expect(agent.post).toHaveBeenCalledWith(
            expect.objectContaining({ text: "Hello Bluesky" })
        );
        expect(res.postId).toBe("at://did:plc:alice/app.bsky.feed.post/abc123");
        expect(res.releaseURL).toContain("bsky.app/profile/alice.bsky.social/post/abc123");
    });

    it("publishes replies with root and parent refs", async () => {
        const agent = mockAgent({
            getPosts: jest.fn().mockImplementation(({ uris }: { uris: string[] }) => {
                const uri = uris[0];
                return Promise.resolve({
                    data: {
                        posts: [{ uri, cid: uri.includes("reply") ? "bafyreply" : "bafyroot" }],
                    },
                });
            }),
        });

        const root = "at://did:plc:alice/app.bsky.feed.post/root";
        const parent = "at://did:plc:alice/app.bsky.feed.post/reply1";

        await publishBlueskyReply(
            TOKEN,
            root,
            parent,
            { id: "reply-row", message: "Follow-up", settings: {} },
            { createAgent: () => agent }
        );

        expect(agent.post).toHaveBeenCalledWith(
            expect.objectContaining({
                text: "Follow-up",
                reply: {
                    root: { uri: root, cid: "bafyroot" },
                    parent: { uri: parent, cid: "bafyreply" },
                },
            })
        );
    });

    it("searches actors for mentions", async () => {
        const agent = mockAgent();
        const res = await searchBlueskyActors(TOKEN, "@bob", { createAgent: () => agent });
        expect(agent.searchActors).toHaveBeenCalledWith({ q: "bob", limit: 10 });
        expect(res).toEqual([
            {
                id: "bob.bsky.social",
                label: "Bob (@bob.bsky.social)",
                image: "https://cdn.example/avatar.jpg",
            },
        ]);
    });
});
