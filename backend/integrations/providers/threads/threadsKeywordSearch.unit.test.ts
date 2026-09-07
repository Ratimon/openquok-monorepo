import { describe, expect, it, jest, afterEach } from "@jest/globals";
import { ProviderAccessTokenExpiredError } from "../../../errors/ProviderIntegrationErrors.js";
import {
    assertThreadDiscoverableViaKeywordSearch,
    buildThreadsKeywordSearchQuery,
    threadsKeywordSearch,
} from "./threadsKeywordSearch.js";

describe("buildThreadsKeywordSearchQuery", () => {
    it("strips HTML and uses the first non-empty line", () => {
        expect(
            buildThreadsKeywordSearchQuery("<p>Launch day is here</p>\n<p>Second line ignored</p>")
        ).toBe("Launch day is here");
    });

    it("trims long captions to roughly 80 characters", () => {
        const longLine =
            "OpenQuok ships cross-account Threads comments with keyword search preflight for Meta App Review compliance";
        const query = buildThreadsKeywordSearchQuery(longLine);
        expect(query.length).toBeLessThanOrEqual(80);
        expect(longLine.startsWith(query)).toBe(true);
    });

    it("rejects empty captions", () => {
        expect(() => buildThreadsKeywordSearchQuery("   ")).toThrow(/requires text in the root post/i);
        expect(() => buildThreadsKeywordSearchQuery("<p></p>")).toThrow(/requires text in the root post/i);
    });

    it("rejects emoji-only captions", () => {
        expect(() => buildThreadsKeywordSearchQuery("🚀🔥✨")).toThrow(/emoji-only/i);
    });
});

describe("threadsKeywordSearch", () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.restoreAllMocks();
    });

    it("calls keyword_search with TOP search and expected fields", async () => {
        const fetchMock = jest.fn(async (url: string) => {
            expect(url).toContain("https://graph.threads.net/v1.0/keyword_search?");
            const parsed = new URL(url);
            expect(parsed.searchParams.get("q")).toBe("launch day");
            expect(parsed.searchParams.get("search_type")).toBe("TOP");
            expect(parsed.searchParams.get("fields")).toBe("id,text,permalink,username");
            expect(parsed.searchParams.get("access_token")).toBe("threads-token");

            return {
                ok: true,
                json: async () => ({
                    data: [
                        {
                            id: "thread-1",
                            text: "launch day is here",
                            permalink: "https://www.threads.net/@user/post/abc",
                            username: "user",
                        },
                    ],
                }),
            } as Response;
        });
        global.fetch = fetchMock as unknown as typeof fetch;

        const hits = await threadsKeywordSearch("threads-token", "launch day");

        expect(hits).toEqual([
            {
                id: "thread-1",
                text: "launch day is here",
                permalink: "https://www.threads.net/@user/post/abc",
                username: "user",
            },
        ]);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("throws when Graph returns an error", async () => {
        global.fetch = jest.fn(async () => ({
            ok: false,
            status: 400,
            json: async () => ({ error: { message: "Invalid query" } }),
        })) as unknown as typeof fetch;

        await expect(threadsKeywordSearch("threads-token", "bad")).rejects.toThrow(
            /Threads keyword search failed: Invalid query/
        );
    });

    it("throws ProviderAccessTokenExpiredError for expired tokens", async () => {
        global.fetch = jest.fn(async () => ({
            ok: false,
            status: 400,
            json: async () => ({ error: { message: "Session expired", code: 190 } }),
        })) as unknown as typeof fetch;

        await expect(threadsKeywordSearch("expired-token", "launch")).rejects.toBeInstanceOf(
            ProviderAccessTokenExpiredError
        );
    });
});

describe("assertThreadDiscoverableViaKeywordSearch", () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.restoreAllMocks();
    });

    it("passes when the expected thread id is in search results", async () => {
        global.fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                data: [{ id: "thread-123", text: "hello world" }],
            }),
        })) as unknown as typeof fetch;

        await expect(
            assertThreadDiscoverableViaKeywordSearch("token", "hello world", "thread-123")
        ).resolves.toBeUndefined();
    });

    it("throws an actionable error when the thread is missing from results", async () => {
        global.fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                data: [{ id: "other-thread", text: "hello world" }],
            }),
        })) as unknown as typeof fetch;

        await expect(
            assertThreadDiscoverableViaKeywordSearch("token", "hello world", "thread-123")
        ).rejects.toThrow(/Thread thread-123 was not found for query "hello world"/);
        await expect(
            assertThreadDiscoverableViaKeywordSearch("token", "hello world", "thread-123")
        ).rejects.toThrow(/increasing the plug delay/i);
    });
});
