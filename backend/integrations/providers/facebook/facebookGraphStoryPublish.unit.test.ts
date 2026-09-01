import {
    publishFacebookPageStories,
    readFacebookPostType,
} from "./facebookGraphStoryPublish.js";

describe("readFacebookPostType", () => {
    it("reads flat post_type from providerSettings (CLI/API)", () => {
        expect(
            readFacebookPostType({
                providerSettings: { post_type: "story" },
            })
        ).toBe("story");
    });

    it("reads nested facebook.postType from providerSettings (web composer)", () => {
        expect(
            readFacebookPostType({
                providerSettings: {
                    facebook: { postType: "story" },
                },
            })
        ).toBe("story");
    });

    it("reads facebook bucket at root (validateCreatePost payload)", () => {
        expect(
            readFacebookPostType({
                facebook: { postType: "story" },
            })
        ).toBe("story");
    });

    it("prefers nested facebook bucket over flat providerSettings keys", () => {
        expect(
            readFacebookPostType({
                providerSettings: {
                    post_type: "post",
                    facebook: { postType: "story" },
                },
            })
        ).toBe("story");
    });

    it("reads flat postType (camelCase) from providerSettings", () => {
        expect(
            readFacebookPostType({
                providerSettings: { postType: "story" },
            })
        ).toBe("story");
    });

    it("reads flat keys at settings root (legacy API / tests)", () => {
        expect(readFacebookPostType({ post_type: "story" })).toBe("story");
        expect(readFacebookPostType({ postType: "story" })).toBe("story");
    });

    it("defaults to post when settings are empty or unknown", () => {
        expect(readFacebookPostType(null)).toBe("post");
        expect(readFacebookPostType({ providerSettings: {} })).toBe("post");
        expect(readFacebookPostType({ post_type: "feed" })).toBe("post");
        expect(readFacebookPostType({ postType: "reel" })).toBe("post");
    });
});

describe("publishFacebookPageStories", () => {
    const pageId = "page-123";
    const accessToken = "token-abc";
    const publicMediaUrl = "https://cdn.example.com/photo.jpg";
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = jest.fn(async (url: string | URL, init?: RequestInit) => {
            const href = String(url);

            if (href.includes("/photos?") && init?.method === "POST") {
                return {
                    ok: true,
                    json: async () => ({ id: "photo-1" }),
                } as Response;
            }

            if (href.includes("/photo_stories?") && init?.method === "POST") {
                return {
                    ok: true,
                    json: async () => ({ post_id: "story-photo-1" }),
                } as Response;
            }

            if (href.includes("upload_phase=start")) {
                return {
                    ok: true,
                    json: async () => ({
                        video_id: "video-1",
                        upload_url: "https://upload.example.com/video",
                    }),
                } as Response;
            }

            if (href === "https://upload.example.com/video") {
                return {
                    ok: true,
                    json: async () => ({ success: true }),
                } as Response;
            }

            if (href.includes("/video-1?fields=status")) {
                return {
                    ok: true,
                    json: async () => ({
                        status: { uploading_phase: "complete", processing_phase: "ready" },
                    }),
                } as Response;
            }

            if (href.includes("upload_phase=finish")) {
                return {
                    ok: true,
                    json: async () => ({ post_id: "story-video-1" }),
                } as Response;
            }

            throw new Error(`Unexpected fetch: ${href}`);
        }) as typeof fetch;
    });

    afterEach(() => {
        jest.useRealTimers();
        global.fetch = originalFetch;
        jest.restoreAllMocks();
    });

    it("publishes a single photo story", async () => {
        const result = await publishFacebookPageStories(pageId, accessToken, {
            id: "post-1",
            message: "",
            settings: {
                media: [{ path: publicMediaUrl }],
            },
        });

        expect(result).toEqual({
            id: "post-1",
            postId: "story-photo-1",
            status: "success",
            releaseURL: "https://www.facebook.com/stories/story-photo-1",
        });
    });

    it("publishes multiple photo stories sequentially", async () => {
        let photoCount = 0;
        global.fetch = jest.fn(async (url: string | URL, init?: RequestInit) => {
            const href = String(url);

            if (href.includes("/photos?") && init?.method === "POST") {
                photoCount += 1;
                return {
                    ok: true,
                    json: async () => ({ id: `photo-${photoCount}` }),
                } as Response;
            }

            if (href.includes("/photo_stories?") && init?.method === "POST") {
                return {
                    ok: true,
                    json: async () => ({ post_id: `story-photo-${photoCount}` }),
                } as Response;
            }

            throw new Error(`Unexpected fetch: ${href}`);
        }) as typeof fetch;

        const result = await publishFacebookPageStories(pageId, accessToken, {
            id: "post-2",
            message: "",
            settings: {
                media: [
                    { path: "https://cdn.example.com/a.jpg" },
                    { path: "https://cdn.example.com/b.jpg" },
                ],
            },
        });

        expect(photoCount).toBe(2);
        expect(result.postId).toBe("story-photo-2");
        expect(result.releaseURL).toBe("https://www.facebook.com/stories/story-photo-2");
    });

    it("publishes a video story after polling until ready", async () => {
        const result = await publishFacebookPageStories(pageId, accessToken, {
            id: "post-3",
            message: "",
            settings: {
                media: [{ path: "https://cdn.example.com/clip.mp4" }],
            },
        });

        expect(result).toEqual({
            id: "post-3",
            postId: "story-video-1",
            status: "success",
            releaseURL: "https://www.facebook.com/stories/story-video-1",
        });
    });

    it("rejects stories without media", async () => {
        await expect(
            publishFacebookPageStories(pageId, accessToken, {
                id: "post-4",
                message: "caption only",
                settings: {},
            })
        ).rejects.toThrow("Story should have at least one media");
    });

    it("reads media from nested media.items (composer shape)", async () => {
        const result = await publishFacebookPageStories(pageId, accessToken, {
            id: "post-5",
            message: "",
            settings: {
                media: {
                    items: [{ path: publicMediaUrl }],
                },
            },
        });

        expect(result.postId).toBe("story-photo-1");
    });

    it("warns when a later story fails after one already published", async () => {
        let photoStoriesCalls = 0;
        global.fetch = jest.fn(async (url: string | URL, init?: RequestInit) => {
            const href = String(url);

            if (href.includes("/photos?") && init?.method === "POST") {
                return {
                    ok: true,
                    json: async () => ({ id: "photo-1" }),
                } as Response;
            }

            if (href.includes("/photo_stories?") && init?.method === "POST") {
                photoStoriesCalls += 1;
                if (photoStoriesCalls === 1) {
                    return {
                        ok: true,
                        json: async () => ({ post_id: "story-photo-1" }),
                    } as Response;
                }
                return {
                    ok: true,
                    json: async () => ({ error: { message: "Transient Graph error" } }),
                } as Response;
            }

            throw new Error(`Unexpected fetch: ${href}`);
        }) as typeof fetch;

        await expect(
            publishFacebookPageStories(pageId, accessToken, {
                id: "post-6",
                message: "",
                settings: {
                    media: [
                        { path: "https://cdn.example.com/a.jpg" },
                        { path: "https://cdn.example.com/b.jpg" },
                    ],
                },
            })
        ).rejects.toThrow(
            "Publishing may have partially completed. One or more Facebook Stories may already be live. Check your Page before retrying."
        );
        expect(photoStoriesCalls).toBe(2);
    });

    it("polls video status until ready before finishing", async () => {
        jest.useFakeTimers();
        let statusPolls = 0;

        global.fetch = jest.fn(async (url: string | URL, init?: RequestInit) => {
            const href = String(url);

            if (href.includes("upload_phase=start")) {
                return {
                    ok: true,
                    json: async () => ({
                        video_id: "video-2",
                        upload_url: "https://upload.example.com/video-2",
                    }),
                } as Response;
            }

            if (href === "https://upload.example.com/video-2") {
                return {
                    ok: true,
                    json: async () => ({ success: true }),
                } as Response;
            }

            if (href.includes("/video-2?fields=status")) {
                statusPolls += 1;
                if (statusPolls === 1) {
                    return {
                        ok: true,
                        json: async () => ({ status: { uploading_phase: "in_progress" } }),
                    } as Response;
                }
                return {
                    ok: true,
                    json: async () => ({
                        status: { uploading_phase: "complete", processing_phase: "ready" },
                    }),
                } as Response;
            }

            if (href.includes("upload_phase=finish")) {
                return {
                    ok: true,
                    json: async () => ({ post_id: "story-video-2" }),
                } as Response;
            }

            throw new Error(`Unexpected fetch: ${href}`);
        }) as typeof fetch;

        const publishPromise = publishFacebookPageStories(pageId, accessToken, {
            id: "post-7",
            message: "",
            settings: {
                media: [{ path: "https://cdn.example.com/clip.mp4" }],
            },
        });

        await jest.advanceTimersByTimeAsync(10_000);
        const result = await publishPromise;

        expect(statusPolls).toBe(2);
        expect(result.postId).toBe("story-video-2");
    });
});
