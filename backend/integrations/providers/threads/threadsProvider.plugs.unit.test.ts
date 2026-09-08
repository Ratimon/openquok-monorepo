import { describe, expect, it, jest, afterEach } from "@jest/globals";
import type { IntegrationRecord } from "../../social.integrations.interface";
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

    it("requests threads_manage_mentions for cross-account comments", () => {
        const provider = new ThreadsProvider();
        expect(provider.scopes).toContain("threads_manage_mentions");
        expect(provider.scopes).not.toContain("threads_keyword_search");
    });

    it("requires caption or media when scheduling", () => {
        const provider = new ThreadsProvider();
        expect(provider.validateCreatePost?.({ status: "draft", mediaCount: 0, message: "" })).toBeNull();
        expect(
            provider.validateCreatePost?.({ status: "scheduled", mediaCount: 0, message: "   " })
        ).toMatch(/caption or at least one image or video/i);
        expect(
            provider.validateCreatePost?.({ status: "scheduled", mediaCount: 1, message: "" })
        ).toBeNull();
        expect(
            provider.validateCreatePost?.({ status: "scheduled", mediaCount: 0, message: "Hello" })
        ).toBeNull();
    });
});

describe("ThreadsProvider threadsCrossAccountComment", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("publishes same-account comment", async () => {
        const provider = new ThreadsProvider();
        const commentSpy = jest.spyOn(provider, "comment").mockResolvedValue([]);

        const integration = {
            internal_id: "threads-user-1",
            token: "token-1",
        } as IntegrationRecord;

        await provider.threadsCrossAccountComment(integration, integration, "thread-123", {
            comment: "Same account reply",
        });

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

    it("publishes cross-account comment without keyword search preflight", async () => {
        const provider = new ThreadsProvider();
        const commentSpy = jest.spyOn(provider, "comment").mockResolvedValue([]);

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
        });

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

    it("skips when comment is empty", async () => {
        const provider = new ThreadsProvider();
        const commentSpy = jest.spyOn(provider, "comment").mockResolvedValue([]);

        await provider.threadsCrossAccountComment(
            { internal_id: "u", token: "t" } as IntegrationRecord,
            { internal_id: "other", token: "t2" } as IntegrationRecord,
            "thread-123",
            { comment: "   " }
        );

        expect(commentSpy).not.toHaveBeenCalled();
    });
});
