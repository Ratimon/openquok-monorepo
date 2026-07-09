import { describe, expect, it, jest } from "@jest/globals";
import type { IntegrationRecord } from "../social.integrations.interface";
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
});

describe("ThreadsProvider threadsCrossAccountComment", () => {
    it("calls comment with acting integration token and plain-text comment", async () => {
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

        commentSpy.mockRestore();
    });

    it("skips when comment is empty", async () => {
        const provider = new ThreadsProvider();
        const commentSpy = jest.spyOn(provider, "comment").mockResolvedValue([]);

        await provider.threadsCrossAccountComment(
            { internal_id: "u", token: "t" } as IntegrationRecord,
            {} as IntegrationRecord,
            "thread-123",
            { comment: "   " }
        );

        expect(commentSpy).not.toHaveBeenCalled();
        commentSpy.mockRestore();
    });
});
