import { ProviderAccessTokenExpiredError } from "../../../errors/ProviderIntegrationErrors.js";
import {
    buildDevtoArticlePayload,
    mapDevtoApiError,
    mapDevtoTagOptions,
    publishDevtoArticle,
    uniqueOrganizationUsernamesFromArticles,
    validateDevtoTitle,
} from "./devtoPublish.js";

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

describe("validateDevtoTitle", () => {
    it("rejects titles shorter than 2 characters", () => {
        expect(() => validateDevtoTitle("")).toThrow(/at least 2 characters/);
        expect(() => validateDevtoTitle("a")).toThrow(/at least 2 characters/);
        expect(() => validateDevtoTitle("ab")).not.toThrow();
    });
});

describe("buildDevtoArticlePayload", () => {
    it("maps title, markdown body, tags, cover, canonical, and organization", () => {
        expect(
            buildDevtoArticlePayload(
                {
                    title: "Hello Dev",
                    tags: ["javascript", "webdev"],
                    canonical: "https://example.com/post",
                    organizationId: 12,
                    mainImagePath: "composer-media/cover.jpg",
                },
                "# Body",
                "https://cdn.example.com/cover.jpg"
            )
        ).toEqual({
            article: {
                title: "Hello Dev",
                published: true,
                body_markdown: "# Body",
                tags: ["javascript", "webdev"],
                canonical_url: "https://example.com/post",
                main_image: "https://cdn.example.com/cover.jpg",
                organization_id: 12,
            },
        });
    });

    it("omits optional fields when unset", () => {
        expect(buildDevtoArticlePayload({ title: "Only title", tags: [] }, "")).toEqual({
            article: {
                title: "Only title",
                published: true,
                body_markdown: "",
            },
        });
    });
});

describe("mapDevtoApiError", () => {
    it("maps canonical URL collisions to a clear error", () => {
        expect(mapDevtoApiError({ error: "Canonical url has already been taken" }, 422)).toBe(
            "This canonical URL is already used on another Dev.to article. Use a different canonical URL or omit it."
        );
    });
});

describe("mapDevtoTagOptions", () => {
    it("maps id/name rows to value/label options", () => {
        expect(
            mapDevtoTagOptions([
                { id: 6, name: "javascript" },
                { id: 1, name: "webdev" },
                { id: 2, name: "" },
            ])
        ).toEqual([
            { value: 6, label: "javascript" },
            { value: 1, label: "webdev" },
        ]);
    });
});

describe("uniqueOrganizationUsernamesFromArticles", () => {
    it("collects unique organization usernames", () => {
        expect(
            uniqueOrganizationUsernamesFromArticles([
                { organization: { username: "acme", name: "Acme" } },
                { organization: { username: "acme" } },
                { organization: { slug: "other" } },
                { organization: null },
                {},
            ])
        ).toEqual(["acme", "other"]);
    });
});

describe("publishDevtoArticle", () => {
    it("posts the article JSON and returns id/url", async () => {
        mockFetchJson(201, { id: 55, url: "https://dev.to/user/hello" });

        await expect(
            publishDevtoArticle("key", {
                id: "post-1",
                message: "Hello",
                settings: { providerSettings: { title: "Hello Dev" } },
            })
        ).resolves.toEqual({
            id: "post-1",
            postId: "55",
            status: "success",
            releaseURL: "https://dev.to/user/hello",
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://dev.to/api/articles",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({ "api-key": "key" }),
            })
        );
        const body = JSON.parse(String((global.fetch as jest.Mock).mock.calls[0][1].body));
        expect(body.article).toMatchObject({ title: "Hello Dev", body_markdown: "Hello", published: true });
    });

    it("maps canonical URL collisions", async () => {
        mockFetchJson(422, { error: "Canonical url has already been taken", status: 422 });

        await expect(
            publishDevtoArticle("key", {
                id: "post-1",
                message: "Hello",
                settings: {
                    providerSettings: {
                        title: "Hello Dev",
                        canonical: "https://example.com/taken",
                    },
                },
            })
        ).rejects.toThrow(/canonical URL is already used/i);
    });

    it("raises ProviderAccessTokenExpiredError on 401", async () => {
        mockFetchJson(401, { error: "unauthorized", status: 401 });

        await expect(
            publishDevtoArticle("bad", {
                id: "post-1",
                message: "Hello",
                settings: { providerSettings: { title: "Hello Dev" } },
            })
        ).rejects.toBeInstanceOf(ProviderAccessTokenExpiredError);
    });
});
