import type { AnalyticsData } from "../../social.integrations.interface.js";
import {
    appendTiktokRecentVideoEngagement,
    buildTiktokPostAnalyticsRows,
    listTiktokVideos,
    queryTiktokVideoMetrics,
    resolveTiktokPublicVideoId,
} from "./tiktokVideoApi.js";

const originalFetch = global.fetch;

afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
});

function mockFetchSequence(responses: Array<{ status?: number; body: unknown }>) {
    let call = 0;
    global.fetch = jest.fn().mockImplementation(async () => {
        const next = responses[call] ?? responses[responses.length - 1]!;
        call += 1;
        return {
            ok: (next.status ?? 200) < 400,
            status: next.status ?? 200,
            json: async () => next.body,
        } as Response;
    });
}

describe("listTiktokVideos", () => {
    it("returns parsed videos when TikTok responds with a list", async () => {
        mockFetchSequence([
            {
                body: {
                    data: {
                        videos: [
                            { id: "7123", cover_image_url: "https://cdn.example.com/cover.jpg", title: "Clip" },
                        ],
                    },
                    error: { code: "ok" },
                },
            },
        ]);

        await expect(listTiktokVideos("token", { fields: "id,cover_image_url,title" })).resolves.toEqual([
            { id: "7123", cover_image_url: "https://cdn.example.com/cover.jpg", title: "Clip" },
        ]);
    });

    it("returns [] on API error", async () => {
        mockFetchSequence([
            {
                body: {
                    data: {},
                    error: { code: "scope_not_authorized", message: "nope" },
                },
            },
        ]);

        await expect(listTiktokVideos("token", { fields: "id" })).resolves.toEqual([]);
    });
});

describe("queryTiktokVideoMetrics", () => {
    it("queries metrics for provided ids", async () => {
        mockFetchSequence([
            {
                body: {
                    data: {
                        videos: [
                            {
                                id: "99",
                                view_count: 1000,
                                like_count: 50,
                                comment_count: 4,
                                share_count: 2,
                            },
                        ],
                    },
                    error: { code: "ok" },
                },
            },
        ]);

        await expect(queryTiktokVideoMetrics("token", ["99"])).resolves.toEqual([
            {
                id: "99",
                view_count: 1000,
                like_count: 50,
                comment_count: 4,
                share_count: 2,
            },
        ]);
    });
});

describe("resolveTiktokPublicVideoId", () => {
    it("returns release id unchanged when it is already a public video id", async () => {
        await expect(resolveTiktokPublicVideoId("token", "7123456789")).resolves.toBe("7123456789");
    });

    it("resolves interim publish ids through publish status fetch", async () => {
        mockFetchSequence([
            {
                body: {
                    data: { publicaly_available_post_id: ["99887766"] },
                    error: { code: "ok" },
                },
            },
        ]);

        await expect(resolveTiktokPublicVideoId("token", "v_pub_url~abc")).resolves.toBe("99887766");
    });
});

describe("appendTiktokRecentVideoEngagement", () => {
    it("aggregates recent video engagement into analytics rows", async () => {
        mockFetchSequence([
            {
                body: {
                    data: { videos: [{ id: "1" }, { id: "2" }] },
                    error: { code: "ok" },
                },
            },
            {
                body: {
                    data: {
                        videos: [
                            { id: "1", view_count: 100, like_count: 10, comment_count: 1, share_count: 2 },
                            { id: "2", view_count: 50, like_count: 5, comment_count: 0, share_count: 1 },
                        ],
                    },
                    error: { code: "ok" },
                },
            },
        ]);

        const rows: AnalyticsData[] = [];
        await appendTiktokRecentVideoEngagement("token", rows, "2026-06-18");

        expect(rows.map((row) => row.label)).toEqual([
            "Views",
            "Recent Likes",
            "Recent Comments",
            "Recent Shares",
        ]);
        expect(rows[0]?.data[0]?.total).toBe("150");
        expect(rows[1]?.data[0]?.total).toBe("15");
    });
});

describe("buildTiktokPostAnalyticsRows", () => {
    it("maps per-video metrics to analytics labels", () => {
        expect(
            buildTiktokPostAnalyticsRows(
                {
                    id: "1",
                    view_count: 42,
                    like_count: 7,
                    comment_count: 2,
                    share_count: 1,
                },
                "2026-06-18"
            ).map((row) => row.label)
        ).toEqual(["Views", "Likes", "Comments", "Shares"]);
    });
});
