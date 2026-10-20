import { fetchBacklinksSummaryLive } from "./dataforseoClient";

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
