import {
    fetchBacklinksSummaryLive,
    fetchBacklinksTimeseriesSummaryLive,
} from "./dataforseoClient";

jest.mock("../../config/GlobalConfig", () => ({
    config: {
        dataforseo: { apiKey: "dGVzdDpzZWNyZXQ=" },
        directorySeo: { enabled: true },
    },
}));

describe("fetchBacklinksSummaryLive", () => {
    it("parses domain rating from a successful task", async () => {
        const fetchImpl = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                tasks: [
                    {
                        status_code: 20000,
                        result: [{ rank: 42.5 }],
                    },
                ],
            }),
        });

        const result = await fetchBacklinksSummaryLive("example.com", fetchImpl as typeof fetch);

        expect(result.domainRating).toBe(42.5);
        expect(fetchImpl).toHaveBeenCalledWith(
            "https://api.dataforseo.com/v3/backlinks/summary/live",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    Authorization: "Basic dGVzdDpzZWNyZXQ=",
                }),
            })
        );
        const body = JSON.parse((fetchImpl.mock.calls[0][1] as RequestInit).body as string);
        expect(body[0]).toMatchObject({ rank_scale: "one_hundred" });
    });

    it("treats no search results as an empty summary", async () => {
        const fetchImpl = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                tasks: [
                    {
                        status_code: 40501,
                        status_message: "No Search Results.",
                        result: null,
                    },
                ],
            }),
        });

        const result = await fetchBacklinksSummaryLive("unknown.test", fetchImpl as typeof fetch);
        expect(result.domainRating).toBeNull();
    });
});

describe("fetchBacklinksTimeseriesSummaryLive", () => {
    it("parses daily rank points with one_hundred scale and ISO dates", async () => {
        const fetchImpl = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                tasks: [
                    {
                        status_code: 20000,
                        result: [
                            {
                                target: "example.com",
                                items: [
                                    { date: "2026-10-01", rank: 40 },
                                    { date: "2026-10-02", rank: 41.2 },
                                    { date: "2026-10-03", rank: 0 },
                                    { date: "2026-10-04" },
                                ],
                            },
                        ],
                    },
                ],
            }),
        });

        const result = await fetchBacklinksTimeseriesSummaryLive(
            "example.com",
            { dateFrom: "2026-10-01", dateTo: "2026-10-04", groupRange: "day" },
            fetchImpl as typeof fetch
        );

        expect(result.points).toEqual([
            { capturedAt: "2026-10-01T00:00:00.000Z", domainRating: 40 },
            { capturedAt: "2026-10-02T00:00:00.000Z", domainRating: 41.2 },
        ]);
        expect(fetchImpl).toHaveBeenCalledWith(
            "https://api.dataforseo.com/v3/backlinks/timeseries_summary/live",
            expect.objectContaining({ method: "POST" })
        );
        const body = JSON.parse((fetchImpl.mock.calls[0][1] as RequestInit).body as string);
        expect(body[0]).toEqual({
            target: "example.com",
            date_from: "2026-10-01",
            date_to: "2026-10-04",
            group_range: "day",
            include_subdomains: true,
            rank_scale: "one_hundred",
        });
    });

    it("parses ISO datetime strings in item dates", async () => {
        const fetchImpl = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                tasks: [
                    {
                        status_code: 20000,
                        result: [
                            {
                                items: [{ date: "2026-10-05T12:30:00.000Z", rank: 50 }],
                            },
                        ],
                    },
                ],
            }),
        });

        const result = await fetchBacklinksTimeseriesSummaryLive(
            "example.com",
            { dateFrom: "2026-10-05", dateTo: "2026-10-05", groupRange: "day" },
            fetchImpl as typeof fetch
        );

        expect(result.points).toEqual([
            { capturedAt: "2026-10-05T12:30:00.000Z", domainRating: 50 },
        ]);
    });

    it("returns no points when the task has no search results", async () => {
        const fetchImpl = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                tasks: [
                    {
                        status_code: 40501,
                        status_message: "No Search Results.",
                        result: null,
                    },
                ],
            }),
        });

        const result = await fetchBacklinksTimeseriesSummaryLive(
            "unknown.test",
            { dateFrom: "2026-01-01", dateTo: "2026-01-31", groupRange: "day" },
            fetchImpl as typeof fetch
        );
        expect(result.points).toEqual([]);
    });
});
