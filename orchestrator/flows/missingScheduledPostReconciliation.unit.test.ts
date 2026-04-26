/// <reference types="jest" />
import { faker } from "@faker-js/faker";
import { logger } from "backend/utils/Logger.js";
import { runMissingScheduledPostRescan } from "./missingScheduledPostReconciliation.js";
import { runScheduledSocialPostOrchestration } from "./scheduledSocialPostWorkflow.js";

/**
 * Only the fields this module reads. Do not add `integrationRefresh` (production default is `bullmq` in
 * `orchestratorFlows`); a partial `config.bullmq` with `integrationRefresh: { transport: "bullmq" }`
 * would make other Flowcraft unit tests in the same Jest worker enqueue to BullMQ. Leaving it unset
 * means `integrationRefresh` is `undefined` here — not production parity, but not the enqueue branch either.
 * Mutable: tests flip `scheduledSocialPost.transport` only.
 */
const mockBullmqSection: { scheduledSocialPost: { transport: string } } = {
    scheduledSocialPost: { transport: "in_process" },
};

jest.mock("backend/config/GlobalConfig.js", () => ({
    config: {
        get bullmq() {
            return mockBullmqSection;
        },
    },
}));

const listMock = jest.fn();

jest.mock("backend/repositories/index.js", () => ({
    postsRepository: {
        listQueuePostGroupsForMissingPublishRescan: (...args: unknown[]) => listMock(...args),
    },
}));

jest.mock("./scheduledSocialPostWorkflow.js", () => ({
    runScheduledSocialPostOrchestration: jest.fn(),
}));

const mockedRun = jest.mocked(runScheduledSocialPostOrchestration);

describe("runMissingScheduledPostRescan", () => {
    let infoSpy: jest.SpyInstance;

    beforeEach(() => {
        mockBullmqSection.scheduledSocialPost.transport = "in_process";
        listMock.mockReset();
        mockedRun.mockReset();
        infoSpy = jest.spyOn(logger, "info").mockImplementation(() => {});
    });

    afterEach(() => {
        infoSpy.mockRestore();
    });

    it("returns without DB or enqueue when transport is not bullmq", async () => {
        await runMissingScheduledPostRescan();
        expect(listMock).not.toHaveBeenCalled();
        expect(mockedRun).not.toHaveBeenCalled();
    });

    it("lists groups in a ±2h window and re-enqueues each; logs when orchestration returns true", async () => {
        mockBullmqSection.scheduledSocialPost.transport = "bullmq";
        const orgA = faker.string.uuid();
        const orgB = faker.string.uuid();
        const g1 = faker.string.uuid();
        const g2 = faker.string.uuid();
        listMock.mockResolvedValue([
            { organizationId: orgA, postGroup: g1 },
            { organizationId: orgB, postGroup: g2 },
        ]);
        mockedRun.mockResolvedValue(true);

        await runMissingScheduledPostRescan();

        expect(listMock).toHaveBeenCalledTimes(1);
        const [fromIso, toIso] = listMock.mock.calls[0]!;
        expect(new Date(toIso).getTime() - new Date(fromIso).getTime()).toBe(4 * 60 * 60 * 1000);

        expect(mockedRun).toHaveBeenCalledTimes(2);
        expect(mockedRun).toHaveBeenNthCalledWith(1, {
            organizationId: orgA,
            postGroup: g1,
            delayMs: 0,
        });
        expect(mockedRun).toHaveBeenNthCalledWith(2, {
            organizationId: orgB,
            postGroup: g2,
            delayMs: 0,
        });
        expect(infoSpy).toHaveBeenCalledTimes(2);
        expect(infoSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                msg: "[Orchestrator] Re-enqueued missing scheduled post group (DB rescan)",
                organizationId: orgA,
                postGroup: g1,
            })
        );
    });

    it("does not log info when runScheduledSocialPostOrchestration returns false", async () => {
        mockBullmqSection.scheduledSocialPost.transport = "bullmq";
        listMock.mockResolvedValue([{ organizationId: faker.string.uuid(), postGroup: faker.string.uuid() }]);
        mockedRun.mockResolvedValue(false);

        await runMissingScheduledPostRescan();

        expect(mockedRun).toHaveBeenCalledTimes(1);
        expect(infoSpy).not.toHaveBeenCalled();
    });
});
