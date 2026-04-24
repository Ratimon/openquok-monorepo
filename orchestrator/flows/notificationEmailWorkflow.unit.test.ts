/// <reference types="jest" />
/**
 * Tests `run*Orchestration` (mocked BullMQ enqueue) and in-process Flowcraft graphs via `flow.run` / `runWithTrace`
 * (`flowcraft/testing`). See `refreshTokenWorkflow.unit.test.ts` for more Flowcraft testing notes.
 *
 * **Transport:** API code branches on `config.bullmq.notificationEmail.transport` (`orchestratorFlows` defaults plus
 * optional `ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT` in `GlobalConfig`). Orchestrator Jest clears `ORCHESTRATOR_*`
 * after dotenv (see `jest.orchestrator-default-transport.cjs`) so these tests are stable; set env in the running
 * process or `.env` when you need `bullmq` for integration-style runs outside this suite.
 *
 * **Send-plain cluster throttle:** implemented as a Redis-backed slot in `stores/notificationSendPlainRateRedis.ts`
 * (see that unit test file for why we use distributed throttle instead of Flowcraft sleep nodes). The dispatch
 * node invokes optional `acquireSendPlainSlot` before `sendPlain` when the worker wires it.
 */
import type IORedis from "ioredis";
import { faker } from "@faker-js/faker";
import { FlowRuntime } from "flowcraft";
import { InMemoryEventLogger, runWithTrace } from "flowcraft/testing";
import { logger } from "backend/utils/Logger.js";
import { enqueueNotificationDigestFlushDistributedRun } from "../adapters/flowcraft-bullmq/notification/enqueueNotificationDigestFlushDistributedRun.js";
import { enqueueNotificationSendPlainDistributedRun } from "../adapters/flowcraft-bullmq/notification/enqueueNotificationSendPlainDistributedRun.js";
import {
    NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_VERSION,
    NOTIFICATION_SEND_PLAIN_BLUEPRINT_VERSION,
    buildNotificationDigestFlushBlueprintDistributed,
    buildNotificationSendPlainBlueprintDistributed,
    createNotificationDigestFlushFlowBuilder,
    createNotificationSendPlainFlowBuilder,
    getNotificationEmailNodeRegistry,
    runNotificationDigestFlushOrchestration,
    runNotificationSendPlainOrchestration,
    type NotificationDigestFlushFlowContext,
    type NotificationEmailWorkflowDependencies,
    type NotificationSendPlainFlowContext,
} from "./notificationEmailWorkflow.js";

jest.mock("../adapters/flowcraft-bullmq/notification/enqueueNotificationSendPlainDistributedRun.js", () => ({
    enqueueNotificationSendPlainDistributedRun: jest.fn(),
}));

jest.mock("../adapters/flowcraft-bullmq/notification/enqueueNotificationDigestFlushDistributedRun.js", () => ({
    enqueueNotificationDigestFlushDistributedRun: jest.fn(),
}));

const mockedEnqueueSendPlain = jest.mocked(enqueueNotificationSendPlainDistributedRun);
const mockedEnqueueDigestFlush = jest.mocked(enqueueNotificationDigestFlushDistributedRun);

function fakeRedis(): IORedis {
    return { tag: "mock-redis" } as unknown as IORedis;
}

describe("notificationEmailWorkflow / run*Orchestration", () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        mockedEnqueueSendPlain.mockReset();
        mockedEnqueueDigestFlush.mockReset();
        warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it("runNotificationSendPlainOrchestration returns enqueue result on success", async () => {
        const runId = faker.string.uuid();
        mockedEnqueueSendPlain.mockResolvedValue({ runId, enqueued: true });

        const payload = {
            to: faker.internet.email(),
            subject: faker.lorem.sentence(),
            html: `<p>${faker.lorem.words(3)}</p>`,
            replyTo: faker.internet.email(),
        };
        const result = await runNotificationSendPlainOrchestration(payload, { queueName: "q-test" });

        expect(result).toEqual({ runId, enqueued: true });
        expect(mockedEnqueueSendPlain).toHaveBeenCalledWith(payload, { queueName: "q-test" });
    });

    it("runNotificationSendPlainOrchestration swallows enqueue errors and returns empty run", async () => {
        mockedEnqueueSendPlain.mockRejectedValue(new Error("redis unavailable"));

        const result = await runNotificationSendPlainOrchestration({
            to: faker.internet.email(),
            subject: "s",
            html: "<p>x</p>",
        });

        expect(result).toEqual({ runId: "", enqueued: false });
        expect(warnSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                msg: "[Orchestrator] Failed to enqueue notification send-plain workflow",
                error: "redis unavailable",
            })
        );
    });

    it("runNotificationDigestFlushOrchestration returns enqueue result on success", async () => {
        const runId = faker.string.uuid();
        mockedEnqueueDigestFlush.mockResolvedValue({ runId, enqueued: true });
        const redis = fakeRedis();

        const result = await runNotificationDigestFlushOrchestration(redis, { queueName: "q-digest" });

        expect(result).toEqual({ runId, enqueued: true });
        expect(mockedEnqueueDigestFlush).toHaveBeenCalledWith(redis, { queueName: "q-digest" });
    });

    it("runNotificationDigestFlushOrchestration swallows enqueue errors and returns empty run", async () => {
        mockedEnqueueDigestFlush.mockRejectedValue(new Error("queue full"));
        const redis = fakeRedis();

        const result = await runNotificationDigestFlushOrchestration(redis);

        expect(result).toEqual({ runId: "", enqueued: false });
        expect(warnSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                msg: "[Orchestrator] Failed to enqueue notification digest-flush workflow",
                error: "queue full",
            })
        );
    });
});

describe("notificationEmailWorkflow / Flowcraft testing utilities", () => {
    const sendPlain = jest.fn<Promise<void>, [{ to: string; subject: string; html: string; replyTo?: string }]>();
    const flushAllPendingDigestEmails = jest.fn<Promise<void>, []>();
    const acquireSendPlainSlot = jest.fn<Promise<void>, []>();

    const deps: NotificationEmailWorkflowDependencies = {
        sendPlain,
        flushAllPendingDigestEmails,
        acquireSendPlainSlot,
    };

    beforeEach(() => {
        sendPlain.mockReset().mockResolvedValue(undefined);
        flushAllPendingDigestEmails.mockReset().mockResolvedValue(undefined);
        acquireSendPlainSlot.mockReset().mockResolvedValue(undefined);
    });

    it("InMemoryEventLogger records workflow:start and workflow:finish for send-plain", async () => {
        const eventLogger = new InMemoryEventLogger();
        const flow = createNotificationSendPlainFlowBuilder();
        const runtime = new FlowRuntime<NotificationSendPlainFlowContext, NotificationEmailWorkflowDependencies>({
            dependencies: deps,
            eventBus: eventLogger,
        });

        const initial: NotificationSendPlainFlowContext = {
            to: faker.internet.email(),
            subject: faker.lorem.sentence(),
            html: `<p>${faker.lorem.words(2)}</p>`,
            blueprintVersion: NOTIFICATION_SEND_PLAIN_BLUEPRINT_VERSION,
        };

        const result = await flow.run(runtime, initial);

        expect(result.status).toBe("completed");
        expect(acquireSendPlainSlot).toHaveBeenCalledTimes(1);
        expect(sendPlain).toHaveBeenCalledWith(
            expect.objectContaining({
                to: initial.to,
                subject: initial.subject,
                html: initial.html,
            })
        );
        expect(eventLogger.find("workflow:start")).toBeDefined();
        expect(eventLogger.find("workflow:finish")).toBeDefined();
    });

    it("orders acquireSendPlainSlot before sendPlain when the worker wires the Redis throttle", async () => {
        const callOrder: string[] = [];
        acquireSendPlainSlot.mockImplementation(async () => {
            callOrder.push("acquire");
        });
        sendPlain.mockImplementation(async () => {
            callOrder.push("send");
        });

        const flow = createNotificationSendPlainFlowBuilder();
        const runtime = new FlowRuntime<NotificationSendPlainFlowContext, NotificationEmailWorkflowDependencies>({
            dependencies: deps,
        });

        const initial: NotificationSendPlainFlowContext = {
            to: faker.internet.email(),
            subject: faker.lorem.sentence(),
            html: "<p>order</p>",
            blueprintVersion: NOTIFICATION_SEND_PLAIN_BLUEPRINT_VERSION,
        };

        await flow.run(runtime, initial);

        expect(callOrder).toEqual(["acquire", "send"]);
    });

    it("send-plain runs without acquireSendPlainSlot when dependency is omitted", async () => {
        const flow = createNotificationSendPlainFlowBuilder();
        const runtime = new FlowRuntime<NotificationSendPlainFlowContext, NotificationEmailWorkflowDependencies>({
            dependencies: { sendPlain, flushAllPendingDigestEmails },
        });

        const initial: NotificationSendPlainFlowContext = {
            to: faker.internet.email(),
            subject: "s",
            html: "<p>x</p>",
            blueprintVersion: NOTIFICATION_SEND_PLAIN_BLUEPRINT_VERSION,
        };

        const result = await flow.run(runtime, initial);

        expect(result.status).toBe("completed");
        expect(sendPlain).toHaveBeenCalled();
    });

    it("runWithTrace completes digest-flush graph and invokes flushAllPendingDigestEmails", async () => {
        const flow = createNotificationDigestFlushFlowBuilder();
        const runtime = new FlowRuntime<NotificationDigestFlushFlowContext, NotificationEmailWorkflowDependencies>({
            dependencies: deps,
        });

        const initial: NotificationDigestFlushFlowContext = {
            blueprintVersion: NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_VERSION,
        };

        const result = await runWithTrace(runtime, flow.toBlueprint(), initial, {
            functionRegistry: flow.getFunctionRegistry(),
        });

        expect(result.status).toBe("completed");
        expect(flushAllPendingDigestEmails).toHaveBeenCalledTimes(1);
        expect(sendPlain).not.toHaveBeenCalled();
    });
});

/** Guards Flowcraft’s global `fn_*` keying: worker registry must match the same materialized blueprints. */
describe("notificationEmailWorkflow / distributed blueprints and merged registry", () => {
    it("exposes a function in the merged registry for every `uses` key on each distributed blueprint", () => {
        const send = buildNotificationSendPlainBlueprintDistributed();
        const digest = buildNotificationDigestFlushBlueprintDistributed();
        const reg = getNotificationEmailNodeRegistry() as Record<string, unknown>;
        for (const b of [send, digest]) {
            for (const n of b.nodes ?? []) {
                if (!n.uses) continue;
                expect(typeof reg[n.uses]).toBe("function");
            }
        }
    });
});
