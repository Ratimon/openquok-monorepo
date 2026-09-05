import { publishInstagramGraphComment } from "./instagramGraphComment.js";

describe("publishInstagramGraphComment", () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.restoreAllMocks();
    });

    it("posts top-level comments with form body (not query string)", async () => {
        const fetchMock = jest.fn(async (url: string, init?: RequestInit) => {
            if (url.includes("/comments") && init?.method === "POST") {
                expect(init.headers).toEqual({ "Content-Type": "application/x-www-form-urlencoded" });
                const body = init.body?.toString() ?? "";
                const params = new URLSearchParams(body);
                expect(params.get("access_token")).toBe("page-token");
                expect(params.get("message")).toBe(
                    "Read more: https://www.openquok.com/blog/test?foo=1&bar=2"
                );
                expect(url).not.toContain("message=");
                return {
                    ok: true,
                    json: async () => ({ id: "comment-1" }),
                } as Response;
            }
            if (url.includes("fields=permalink")) {
                return {
                    ok: true,
                    json: async () => ({ permalink: "https://www.instagram.com/p/abc/" }),
                } as Response;
            }
            throw new Error(`unexpected fetch: ${url}`);
        });
        global.fetch = fetchMock as typeof fetch;

        const out = await publishInstagramGraphComment({
            graphHost: "graph.facebook.com",
            apiVersion: "v21.0",
            mediaId: "media-1",
            lastCommentId: "media-1",
            message: "Read more: https://www.openquok.com/blog/test?foo=1&bar=2",
            accessToken: "page-token",
        });

        expect(out).toEqual({
            commentId: "comment-1",
            mediaPermalink: "https://www.instagram.com/p/abc/",
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("posts nested replies under the previous comment id", async () => {
        const fetchMock = jest.fn(async (url: string, init?: RequestInit) => {
            if (url.includes("/replies") && init?.method === "POST") {
                return {
                    ok: true,
                    json: async () => ({ id: "reply-2" }),
                } as Response;
            }
            if (url.includes("fields=permalink")) {
                return {
                    ok: true,
                    json: async () => ({ permalink: "https://www.instagram.com/p/abc/" }),
                } as Response;
            }
            throw new Error(`unexpected fetch: ${url}`);
        });
        global.fetch = fetchMock as typeof fetch;

        const out = await publishInstagramGraphComment({
            graphHost: "graph.facebook.com",
            apiVersion: "v21.0",
            mediaId: "media-1",
            lastCommentId: "comment-1",
            message: "Second reply",
            accessToken: "page-token",
        });

        expect(out.commentId).toBe("reply-2");
        expect(fetchMock.mock.calls[0]?.[0]).toContain("/comment-1/replies");
    });

    it("strips HTML composer bodies before publishing", async () => {
        const fetchMock = jest.fn(async (_url: string, init?: RequestInit) => {
            if (init?.method === "POST") {
                const body = init.body?.toString() ?? "";
                const params = new URLSearchParams(body);
                expect(params.get("message")).toBe("Hello https://example.com");
                return {
                    ok: true,
                    json: async () => ({ id: "comment-1" }),
                } as Response;
            }
            return {
                ok: true,
                json: async () => ({ permalink: "" }),
            } as Response;
        });
        global.fetch = fetchMock as typeof fetch;

        await publishInstagramGraphComment({
            graphHost: "graph.instagram.com",
            apiVersion: "v21.0",
            mediaId: "media-1",
            lastCommentId: undefined,
            message: '<p>Hello <a href="https://example.com">link</a></p>',
            accessToken: "ig-token",
        });
    });
});
