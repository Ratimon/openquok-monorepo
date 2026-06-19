import { YoutubeProvider } from "./youtubeProvider";

const videosListMock = jest.fn();

jest.mock("googleapis", () => ({
    google: {
        auth: {
            OAuth2: jest.fn().mockImplementation(() => ({
                setCredentials: jest.fn(),
            })),
        },
        youtube: jest.fn(() => ({
            videos: {
                list: videosListMock,
            },
        })),
        oauth2: jest.fn(),
    },
}));

jest.mock("../../../config/GlobalConfig", () => ({
    config: {
        integrations: {
            youtube: { clientId: "client-id", clientSecret: "client-secret" },
        },
    },
}));

describe("YoutubeProvider.postAnalytics", () => {
    const provider = new YoutubeProvider();

    beforeEach(() => {
        videosListMock.mockReset();
    });

    it("returns view/like/comment/favorite stats with zero defaults", async () => {
        videosListMock.mockResolvedValue({
            data: {
                items: [
                    {
                        statistics: {
                            viewCount: "12",
                            likeCount: undefined,
                            commentCount: "0",
                        },
                    },
                ],
            },
        });

        const out = await provider.postAnalytics("int-1", "access-token", "MQw0HEBxUwQ", 7);

        expect(videosListMock).toHaveBeenCalledWith({
            part: ["statistics"],
            id: ["MQw0HEBxUwQ"],
        });
        expect(out).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ label: "Views", data: [{ total: "12", date: expect.any(String) }] }),
                expect.objectContaining({ label: "Likes", data: [{ total: "0", date: expect.any(String) }] }),
                expect.objectContaining({ label: "Comments", data: [{ total: "0", date: expect.any(String) }] }),
                expect.objectContaining({ label: "Favorites", data: [{ total: "0", date: expect.any(String) }] }),
            ])
        );
    });

    it("throws when YouTube returns no matching video", async () => {
        videosListMock.mockResolvedValue({ data: { items: [] } });

        await expect(provider.postAnalytics("int-1", "access-token", "MQw0HEBxUwQ", 7)).rejects.toThrow(
            /YouTube video not found/i
        );
    });
});
