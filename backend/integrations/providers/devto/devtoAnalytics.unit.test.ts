import { ProviderAccessTokenExpiredError } from "../../../errors/ProviderIntegrationErrors.js";
import {
    fetchDevtoAccountAnalytics,
    fetchDevtoPostAnalytics,
    mapDevtoHistoricalToAnalytics,
    mapDevtoTotalsToAnalytics,
    startDateForWindow,
} from "./devtoAnalytics.js";
import { DevToProvider } from "./devtoProvider.js";

const originalFetch = global.fetch;

afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
});

function mockFetchJson(status: number, body: unknown) {
    global.fetch = jest.fn().mockResolvedValue({
        ok: status < 400,
        status,
        json: async () => body,
    } as Response);
}

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

const historicalFixture = {
    "2026-08-19": {
        comments: { total: 1 },
        reactions: { total: 4 },
        page_views: { total: 10 },
        follows: { total: 0 },
    },
    "2026-08-20": {
        comments: { total: 2 },
        reactions: { total: 6 },
        page_views: { total: 25 },
        follows: { total: 1 },
    },
};

const totalsFixture = {
    comments: { total: 12 },
    reactions: { total: 40, like: 10, readinglist: 20, unicorn: 5, unique_reactors: 30 },
    page_views: { total: 900, average_read_time_in_seconds: 120, total_read_time_in_seconds: 1000 },
    follows: { total: 3 },
};

describe("mapDevtoHistoricalToAnalytics", () => {
    it("maps page_views, reactions, and comments into dated series", () => {
        expect(mapDevtoHistoricalToAnalytics(historicalFixture)).toEqual([
            {
                label: "Page Views",
                percentageChange: 0,
                data: [
                    { total: "10", date: "2026-08-19" },
                    { total: "25", date: "2026-08-20" },
                ],
            },
            {
                label: "Reactions",
                percentageChange: 0,
                data: [
                    { total: "4", date: "2026-08-19" },
                    { total: "6", date: "2026-08-20" },
                ],
            },
            {
                label: "Comments",
                percentageChange: 0,
                data: [
                    { total: "1", date: "2026-08-19" },
                    { total: "2", date: "2026-08-20" },
                ],
            },
        ]);
    });

    it("returns empty for non-object payloads", () => {
        expect(mapDevtoHistoricalToAnalytics(null)).toEqual([]);
        expect(mapDevtoHistoricalToAnalytics([])).toEqual([]);
    });
});

describe("mapDevtoTotalsToAnalytics", () => {
    it("maps aggregate totals to a single date point", () => {
        expect(mapDevtoTotalsToAnalytics(totalsFixture, "2026-08-21")).toEqual([
            {
                label: "Page Views",
                percentageChange: 0,
                data: [{ total: "900", date: "2026-08-21" }],
            },
            {
                label: "Reactions",
                percentageChange: 0,
                data: [{ total: "40", date: "2026-08-21" }],
            },
            {
                label: "Comments",
                percentageChange: 0,
                data: [{ total: "12", date: "2026-08-21" }],
            },
        ]);
    });
});

describe("fetchDevtoAccountAnalytics", () => {
    it("calls historical without article_id", async () => {
        mockFetchJson(200, historicalFixture);

        const out = await fetchDevtoAccountAnalytics("api-key", 30);
        const start = startDateForWindow(30);

        expect(global.fetch).toHaveBeenCalledWith(
            `https://dev.to/api/analytics/historical?start=${encodeURIComponent(start)}`,
            expect.objectContaining({
                headers: expect.objectContaining({ "api-key": "api-key" }),
            })
        );
        expect(out.find((r) => r.label === "Page Views")?.data).toHaveLength(2);
    });

    it("throws ProviderAccessTokenExpiredError on 401", async () => {
        mockFetchJson(401, { error: "unauthorized", status: 401 });
        await expect(fetchDevtoAccountAnalytics("bad", 7)).rejects.toBeInstanceOf(
            ProviderAccessTokenExpiredError
        );
    });
});

describe("fetchDevtoPostAnalytics", () => {
    it("prefers historical series when present", async () => {
        mockFetchSequence([{ body: historicalFixture }, { body: totalsFixture }]);

        const out = await fetchDevtoPostAnalytics("api-key", "1769817", 14);
        const start = startDateForWindow(14);

        expect(global.fetch).toHaveBeenNthCalledWith(
            1,
            `https://dev.to/api/analytics/historical?start=${encodeURIComponent(start)}&article_id=1769817`,
            expect.anything()
        );
        expect(global.fetch).toHaveBeenNthCalledWith(
            2,
            "https://dev.to/api/analytics/totals?article_id=1769817",
            expect.anything()
        );
        expect(out.find((r) => r.label === "Page Views")?.data).toEqual([
            { total: "10", date: "2026-08-19" },
            { total: "25", date: "2026-08-20" },
        ]);
    });

    it("falls back to totals when historical is empty", async () => {
        mockFetchSequence([{ body: {} }, { body: totalsFixture }]);

        const out = await fetchDevtoPostAnalytics("api-key", "99", 7);
        expect(out.find((r) => r.label === "Reactions")?.data[0]?.total).toBe("40");
    });

    it("rejects blank article ids", async () => {
        await expect(fetchDevtoPostAnalytics("api-key", "  ", 7)).rejects.toThrow(
            /Missing Dev\.to article id/
        );
    });
});

describe("DevToProvider analytics methods", () => {
    const provider = new DevToProvider();

    it("analytics returns mapped historical rows", async () => {
        mockFetchJson(200, historicalFixture);
        const out = await provider.analytics("unused", "api-key", 7);
        expect(out.map((r) => r.label)).toEqual(["Page Views", "Reactions", "Comments"]);
    });

    it("analytics returns [] on failure", async () => {
        mockFetchJson(500, { error: "boom" });
        await expect(provider.analytics("unused", "api-key", 7)).resolves.toEqual([]);
    });

    it("postAnalytics maps article historical rows", async () => {
        mockFetchSequence([{ body: historicalFixture }, { body: totalsFixture }]);
        const out = await provider.postAnalytics("int-1", "api-key", "1769817", 7);
        expect(out.find((r) => r.label === "Comments")?.data[1]?.total).toBe("2");
    });

    it("postAnalytics rethrows expired token errors", async () => {
        mockFetchJson(401, { error: "unauthorized", status: 401 });
        await expect(provider.postAnalytics("int-1", "api-key", "1769817", 7)).rejects.toBeInstanceOf(
            ProviderAccessTokenExpiredError
        );
    });
});
