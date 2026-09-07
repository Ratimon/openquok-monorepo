import { describe, expect, it, jest, afterEach } from "@jest/globals";
import type { IntegrationRecord } from "../social.integrations.interface";
import * as threadsKeywordSearch from "./threads/threadsKeywordSearch.js";
import { ThreadsProvider } from "./threadsProvider";

describe("ThreadsProvider internal plug catalog", () => {
    it("exposes same-account follow-up and cross-account comment plugs", () => {
        const provider = new ThreadsProvider();
        const plugs = provider.internalPlugCatalog();
        expect(plugs.map((p) => p.identifier)).toEqual(
            expect.arrayContaining(["threads-internal-follow-up", "threads-cross-account-comment"])
        );

        const crossAccount = plugs.find((p) => p.identifier === "threads-cross-account-comment");
        expect(crossAccount?.methodName).toBe("threadsCrossAccountComment");
        expect(crossAccount?.pickIntegration).toEqual(["threads"]);
        expect(crossAccount?.fields?.map((f) => f.name)).toContain("comment");
    });

    it("requests threads_keyword_search for cross-account keyword preflight", () => {
        const provider = new ThreadsProvider();
        expect(provider.scopes).toContain("threads_keyword_search");
    });
});

describe("ThreadsProvider threadsCrossAccountComment", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("skips keyword search for same-account comments", async () => {
        const provider = new ThreadsProvider();
        const commentSpy = jest.spyOn(provider, "comment").mockResolvedValue([]);
        const searchSpy = jest.spyOn(
            threadsKeywordSearch,
            "assertThreadDiscoverableViaKeywordSearch"
        );

        const integration = {
            internal_id: "threads-user-1",
            token: "token-1",
        } as IntegrationRecord;

        await provider.threadsCrossAccountComment(integration, integration, "thread-123", {
            comment: "Same account reply",
        });

        expect(searchSpy).not.toHaveBeenCalled();
        expect(commentSpy).toHaveBeenCalledTimes(1);
        expect(commentSpy).toHaveBeenCalledWith(
            "threads-user-1",
            "thread-123",
            undefined,
            "token-1",
            [{ id: "threads-cross-account-plug", message: "Same account reply", settings: {} }],
            integration
        );
    });

    it("runs keyword search preflight before cross-account comment", async () => {
        const provider = new ThreadsProvider();
        const commentSpy = jest.spyOn(provider, "comment").mockResolvedValue([]);
        const searchSpy = jest
            .spyOn(threadsKeywordSearch, "assertThreadDiscoverableViaKeywordSearch")
            .mockResolvedValue(undefined);

        const acting = {
            internal_id: "threads-user-2",
            token: "token-2",
        } as IntegrationRecord;
        const original = {
            internal_id: "threads-user-1",
            token: "token-1",
        } as IntegrationRecord;

        await provider.threadsCrossAccountComment(acting, original, "thread-123", {
            comment: "<p>Great post!</p>",
            rootPostSearchText: "Launch day is here",
        });

        expect(searchSpy).toHaveBeenCalledTimes(1);
        expect(searchSpy).toHaveBeenCalledWith("token-2", "Launch day is here", "thread-123");
        expect(commentSpy).toHaveBeenCalledTimes(1);
        expect(commentSpy).toHaveBeenCalledWith(
            "threads-user-2",
            "thread-123",
            undefined,
            "token-2",
            [{ id: "threads-cross-account-plug", message: "Great post!", settings: {} }],
            acting
        );
    });

    it("throws when cross-account comment lacks rootPostSearchText", async () => {
        const provider = new ThreadsProvider();
        const commentSpy = jest.spyOn(provider, "comment").mockResolvedValue([]);

        await expect(
            provider.threadsCrossAccountComment(
                { internal_id: "threads-user-2", token: "token-2" } as IntegrationRecord,
                { internal_id: "threads-user-1", token: "token-1" } as IntegrationRecord,
                "thread-123",
                { comment: "Great post!" }
            )
        ).rejects.toThrow(/requires rootPostSearchText/i);

        expect(commentSpy).not.toHaveBeenCalled();
    });

    it("throws when keyword search does not return the target thread", async () => {
        const provider = new ThreadsProvider();
        const commentSpy = jest.spyOn(provider, "comment").mockResolvedValue([]);
        jest.spyOn(threadsKeywordSearch, "assertThreadDiscoverableViaKeywordSearch").mockRejectedValue(
            new Error('Thread thread-123 was not found for query "Launch day"')
        );

        await expect(
            provider.threadsCrossAccountComment(
                { internal_id: "threads-user-2", token: "token-2" } as IntegrationRecord,
                { internal_id: "threads-user-1", token: "token-1" } as IntegrationRecord,
                "thread-123",
                {
                    comment: "Great post!",
                    rootPostSearchText: "Launch day",
                }
            )
        ).rejects.toThrow(/Thread thread-123 was not found/);

        expect(commentSpy).not.toHaveBeenCalled();
    });

    it("skips when comment is empty", async () => {
        const provider = new ThreadsProvider();
        const commentSpy = jest.spyOn(provider, "comment").mockResolvedValue([]);
        const searchSpy = jest.spyOn(
            threadsKeywordSearch,
            "assertThreadDiscoverableViaKeywordSearch"
        );

        await provider.threadsCrossAccountComment(
            { internal_id: "u", token: "t" } as IntegrationRecord,
            { internal_id: "other", token: "t2" } as IntegrationRecord,
            "thread-123",
            { comment: "   " }
        );

        expect(searchSpy).not.toHaveBeenCalled();
        expect(commentSpy).not.toHaveBeenCalled();
    });
});
