/// <reference types="jest" />
/**
 * `runScheduledSocialPostOrchestration`: in-process Flowcraft (default Jest `transport` is `in_process`;
 * `jest.orchestrator-default-transport.cjs` clears `ORCHESTRATOR_*_TRANSPORT`). BullMQ branch is
 * covered by setting `config.bullmq.scheduledSocialPost.transport` and mocking the enqueue module.
 */
import { faker } from "@faker-js/faker";
import { config } from "backend/config/GlobalConfig.js";
import { FlowRuntime } from "flowcraft";
import { InMemoryEventLogger, runWithTrace } from "flowcraft/testing";
import { logger } from "backend/utils/Logger.js";
import { enqueueScheduledSocialPostDistributedRun } from "../adapters/flowcraft-bullmq/scheduled-social-post/enqueueScheduledSocialPostDistributedRun.js";
import {
    buildScheduledSocialPostBlueprintDistributed,
    createScheduledSocialPostFlowBuilder,
    getScheduledSocialPostNodeRegistry,
    runScheduledSocialPostOrchestration,
} from "./scheduledSocialPostWorkflow.js";
import {
    SCHEDULED_SOCIAL_POST_BLUEPRINT_VERSION,
    type ScheduledSocialPostFlowContext,
    type ScheduledSocialPostWorkflowDependencies,
} from "../blueprints/scheduledSocialPostFlowTypes.js";

jest.mock("../adapters/flowcraft-bullmq/scheduled-social-post/enqueueScheduledSocialPostDistributedRun.js", () => ({
    enqueueScheduledSocialPostDistributedRun: jest.fn(),
}));

const mockedEnqueue = jest.mocked(enqueueScheduledSocialPostDistributedRun);

type BullmqConfigSlice = { scheduledSocialPost?: { transport?: string; queueName?: string; enabled?: boolean; missingPostRescanIntervalMs?: number } };

function getBullmqConfig(): BullmqConfigSlice {
    return config.bullmq as unknown as BullmqConfigSlice;
}

describe("scheduledSocialPostWorkflow / runScheduledSocialPostOrchestration (in-process)", () => {
    const orgId = faker.string.uuid();
    const postGroup = faker.string.uuid();
    let warnSpy: jest.SpyInstance;
    let prevScheduledSocial: BullmqConfigSlice["scheduledSocialPost"];

    beforeEach(() => {
        warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => {});
        const bull = getBullmqConfig();
        prevScheduledSocial = { ...bull.scheduledSocialPost };
        bull.scheduledSocialPost = {
            ...bull.scheduledSocialPost,
            transport: "in_process",
        };
        mockedEnqueue.mockReset();
    });

    afterEach(() => {
        warnSpy.mockRestore();
        getBullmqConfig().scheduledSocialPost = {
            ...prevScheduledSocial,
        };
    });

    it("returns false when workflowDependencies are omitted (in_process has no path without deps)", async () => {
        const ok = await runScheduledSocialPostOrchestration({ organizationId: orgId, postGroup, delayMs: 0 });
        expect(ok).toBe(false);
    });

    it("returns true when publishScheduledGroup succeeds", async () => {
        const publishScheduledGroup = jest.fn<ReturnType<ScheduledSocialPostWorkflowDependencies["publishScheduledGroup"]>, Parameters<ScheduledSocialPostWorkflowDependencies["publishScheduledGroup"]>>().mockResolvedValue(undefined);
        const ok = await runScheduledSocialPostOrchestration(
            { organizationId: orgId, postGroup, delayMs: 0 },
            { publishScheduledGroup }
        );
        expect(ok).toBe(true);
        expect(publishScheduledGroup).toHaveBeenCalledWith({ organizationId: orgId, postGroup });
    });

    it("returns false and logs when publishScheduledGroup throws", async () => {
        const publishScheduledGroup = jest.fn().mockRejectedValue(new Error("publish failed"));
        const ok = await runScheduledSocialPostOrchestration(
            { organizationId: orgId, postGroup, delayMs: 0 },
            { publishScheduledGroup }
        );
        expect(ok).toBe(false);
        const msgs = warnSpy.mock.calls.map((c) => (c[0] as { msg?: string }).msg);
        expect(msgs.some((m) => m?.includes("publishGroup failed"))).toBe(true);
    });

    it("flow.run completes with InMemoryEventLogger (flowcraft/testing)", async () => {
        const publishScheduledGroup = jest.fn().mockResolvedValue(undefined);
        const dependencies: ScheduledSocialPostWorkflowDependencies = { publishScheduledGroup };
        const eventLogger = new InMemoryEventLogger();
        const runtime = new FlowRuntime<ScheduledSocialPostFlowContext, ScheduledSocialPostWorkflowDependencies>({
            dependencies,
            eventBus: eventLogger,
        });
        const flow = createScheduledSocialPostFlowBuilder();
        const initial: ScheduledSocialPostFlowContext = {
            organizationId: orgId,
            postGroup,
            blueprintVersion: SCHEDULED_SOCIAL_POST_BLUEPRINT_VERSION,
        };
        const result = await flow.run(runtime, initial);
        expect(result.status).toBe("completed");
        expect(publishScheduledGroup).toHaveBeenCalledWith({ organizationId: orgId, postGroup });
    });

    it("runWithTrace completes when blueprint + functionRegistry match (flowcraft/testing)", async () => {
        const publishScheduledGroup = jest.fn().mockResolvedValue(undefined);
        const dependencies: ScheduledSocialPostWorkflowDependencies = { publishScheduledGroup };
        const runtime = new FlowRuntime<ScheduledSocialPostFlowContext, ScheduledSocialPostWorkflowDependencies>({
            dependencies,
        });
        const flow = createScheduledSocialPostFlowBuilder();
        const initial: ScheduledSocialPostFlowContext = {
            organizationId: orgId,
            postGroup,
            blueprintVersion: SCHEDULED_SOCIAL_POST_BLUEPRINT_VERSION,
        };
        const result = await runWithTrace(runtime, flow.toBlueprint(), initial, {
            functionRegistry: flow.getFunctionRegistry(),
        });
        expect(result.status).toBe("completed");
        expect(publishScheduledGroup).toHaveBeenCalledWith({ organizationId: orgId, postGroup });
    });

    it("buildScheduledSocialPostBlueprintDistributed sets id and version metadata", () => {
        const b = buildScheduledSocialPostBlueprintDistributed();
        expect(b.id).toBe("scheduled-social-post");
        expect(b.metadata?.version).toBe(SCHEDULED_SOCIAL_POST_BLUEPRINT_VERSION);
    });

    it("distributed blueprint `uses` keys exist in registry", () => {
        const b = buildScheduledSocialPostBlueprintDistributed();
        const reg = getScheduledSocialPostNodeRegistry() as Record<string, unknown>;
        for (const n of b.nodes ?? []) {
            if (!n.uses) continue;
            expect(typeof reg[n.uses]).toBe("function");
        }
    });
});

describe("runScheduledSocialPostOrchestration (bullmq transport)", () => {
    const orgId = faker.string.uuid();
    const postGroup = faker.string.uuid();
    const queueName = (config.bullmq as BullmqConfigSlice).scheduledSocialPost?.queueName;
    let prevScheduledSocial: BullmqConfigSlice["scheduledSocialPost"];

    beforeEach(() => {
        const bull = getBullmqConfig();
        prevScheduledSocial = { ...bull.scheduledSocialPost };
        bull.scheduledSocialPost = {
            ...bull.scheduledSocialPost,
            transport: "bullmq",
        };
        mockedEnqueue.mockReset();
        mockedEnqueue.mockResolvedValue({ runId: faker.string.uuid(), enqueued: true });
    });

    afterEach(() => {
        getBullmqConfig().scheduledSocialPost = {
            ...prevScheduledSocial,
        };
    });

    it("enqueues distributed run and does not call publishScheduledGroup", async () => {
        const publishScheduledGroup = jest.fn();
        const ok = await runScheduledSocialPostOrchestration(
            { organizationId: orgId, postGroup, delayMs: 42 },
            { publishScheduledGroup }
        );
        expect(ok).toBe(true);
        expect(mockedEnqueue).toHaveBeenCalledWith(
            { organizationId: orgId, postGroup, delayMs: 42 },
            { queueName }
        );
        expect(publishScheduledGroup).not.toHaveBeenCalled();
    });

    it("returns false when enqueue fails", async () => {
        mockedEnqueue.mockRejectedValue(new Error("redis down"));
        const ok = await runScheduledSocialPostOrchestration({ organizationId: orgId, postGroup });
        expect(ok).toBe(false);
    });
});
