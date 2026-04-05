/// <reference types="jest" />
/**
 * Flowcraft workflow tests. This file uses first-party testing helpers from `flowcraft/testing`:
 * - [Unit & integration testing](https://flowcraft.js.org/guide/testing) — `InMemoryEventLogger`, `runWithTrace`
 * - [Interactive debugging (stepper)](https://flowcraft.js.org/guide/debugging) — `createStepper`
 *
 * Time-travel replay and the `flowcraft inspect` CLI need a persistent event store; see
 * [Time-travel debugging](https://flowcraft.js.org/guide/time-travel) and the
 * [CLI tool](https://flowcraft.js.org/guide/cli) when wiring `PersistentEventBusAdapter` for integration-style runs.
 */
import { faker } from "@faker-js/faker";
import { FlowRuntime } from "flowcraft";
import { createStepper, InMemoryEventLogger, runWithTrace } from "flowcraft/testing";
import type { AuthTokenDetails } from "../../integrations/social.integrations.interface";
import type { IntegrationRow } from "../../repositories/IntegrationRepository";
import { logger } from "../../utils/Logger";
import { getIntegrationByIdActivity, refreshIntegrationTokenActivity } from "../activities/integrationRefreshActivities";
import { createRefreshTokenFlowBuilder, runRefreshTokenOrchestration } from "./refreshTokenWorkflow";

jest.mock("../activities/integrationRefreshActivities", () => ({
    getIntegrationByIdActivity: jest.fn(),
    refreshIntegrationTokenActivity: jest.fn(),
    integrationRefreshActivityPolicy: {
        startToCloseTimeoutMs: 60_000,
        maxAttempts: 3,
        initialRetryIntervalMs: 1_000,
        retryBackoffCoefficient: 1,
    },
}));

jest.mock("../sleepChunked", () => ({
    sleepChunked: jest.fn().mockResolvedValue(undefined),
    MAX_TIMER_MS: 2147483647,
}));

const orgId = faker.string.uuid();
const integrationId = faker.string.uuid();

function sampleAuth(): AuthTokenDetails {
    return {
        id: integrationId,
        name: "Channel",
        username: "user",
        accessToken: "new-access",
        expiresIn: 3600,
    };
}

function baseRow(overrides: Partial<IntegrationRow> = {}): IntegrationRow {
    const now = new Date();
    return {
        id: integrationId,
        organization_id: orgId,
        internal_id: "int-1",
        name: "Channel",
        picture: null,
        provider_identifier: "threads",
        type: "social",
        token: "access",
        disabled: false,
        token_expiration: new Date(now.getTime() + 3_600_000).toISOString(),
        refresh_token: "rt",
        profile: "p",
        deleted_at: null,
        in_between_steps: false,
        refresh_needed: false,
        posting_times: "[]",
        custom_instance_details: null,
        additional_settings: "[]",
        customer_id: null,
        root_internal_id: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        ...overrides,
    };
}

describe("refreshTokenWorkflow / runRefreshTokenOrchestration", () => {
    const getById = jest.fn<Promise<IntegrationRow | null>, [string, string]>();
    const runRefresh = jest.fn<Promise<false | AuthTokenDetails>, [IntegrationRow]>();

    beforeEach(() => {
        getById.mockReset();
        runRefresh.mockReset();
        jest.mocked(getIntegrationByIdActivity).mockImplementation(async (repo, organizationIdArg, integrationIdArg) =>
            repo.getById(organizationIdArg, integrationIdArg)
        );
        jest.mocked(refreshIntegrationTokenActivity).mockImplementation(async (fn, row) => fn(row));
    });

    it("completes when the integration row is missing", async () => {
        getById.mockResolvedValue(null);
        const ok = await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, { integrationRepository: { getById }, runRefresh });
        expect(ok).toBe(true);
        expect(runRefresh).not.toHaveBeenCalled();
    });

    it("completes when the row is soft-deleted", async () => {
        getById.mockResolvedValue(baseRow({ deleted_at: new Date().toISOString() }));
        const ok = await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, { integrationRepository: { getById }, runRefresh });
        expect(ok).toBe(true);
        expect(runRefresh).not.toHaveBeenCalled();
    });

    it("completes when in_between_steps is true", async () => {
        getById.mockResolvedValue(baseRow({ in_between_steps: true }));
        const ok = await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, { integrationRepository: { getById }, runRefresh });
        expect(ok).toBe(true);
        expect(runRefresh).not.toHaveBeenCalled();
    });

    it("completes when refresh_needed is true", async () => {
        getById.mockResolvedValue(baseRow({ refresh_needed: true }));
        const ok = await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, { integrationRepository: { getById }, runRefresh });
        expect(ok).toBe(true);
        expect(runRefresh).not.toHaveBeenCalled();
    });

    it("completes when token_expiration is null", async () => {
        getById.mockResolvedValue(baseRow({ token_expiration: null }));
        const ok = await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, { integrationRepository: { getById }, runRefresh });
        expect(ok).toBe(true);
        expect(runRefresh).not.toHaveBeenCalled();
    });

    it("completes when token is already expired (zero wait window)", async () => {
        getById.mockResolvedValue(baseRow({ token_expiration: new Date(Date.now() - 60_000).toISOString() }));
        const ok = await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, { integrationRepository: { getById }, runRefresh });
        expect(ok).toBe(true);
        expect(runRefresh).not.toHaveBeenCalled();
    });

    it("completes when post-sleep load returns no row (refresh not called)", async () => {
        getById.mockResolvedValueOnce(baseRow()).mockResolvedValueOnce(null);
        const ok = await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, { integrationRepository: { getById }, runRefresh });
        expect(ok).toBe(true);
        expect(getById).toHaveBeenCalledTimes(2);
        expect(runRefresh).not.toHaveBeenCalled();
    });

    it("completes when refresh returns false", async () => {
        getById.mockResolvedValue(baseRow());
        runRefresh.mockResolvedValue(false);
        const ok = await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, { integrationRepository: { getById }, runRefresh });
        expect(ok).toBe(true);
        expect(runRefresh).toHaveBeenCalledTimes(1);
    });

    it("runs one successful tick then stops when the next iteration sees a missing row", async () => {
        const row = baseRow();
        getById.mockResolvedValueOnce(row).mockResolvedValueOnce(row).mockResolvedValueOnce(null);
        runRefresh.mockResolvedValue(sampleAuth());

        const debugSpy = jest.spyOn(logger, "debug").mockImplementation(() => {});

        const ok = await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, { integrationRepository: { getById }, runRefresh });

        expect(ok).toBe(true);
        expect(getById).toHaveBeenCalledTimes(3);
        expect(runRefresh).toHaveBeenCalledTimes(1);
        expect(runRefresh).toHaveBeenCalledWith(row);
        expect(debugSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                msg: "[Orchestrator] refresh-token tick completed",
                integrationId,
                organizationId: orgId,
            })
        );

        debugSpy.mockRestore();
    });

    it("stops when getIntegrationByIdActivity throws after passthrough", async () => {
        jest.mocked(getIntegrationByIdActivity).mockRejectedValueOnce(new Error("db down"));
        const ok = await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, { integrationRepository: { getById }, runRefresh });
        expect(ok).toBe(true);
        expect(runRefresh).not.toHaveBeenCalled();
    });

    it("stops when refreshIntegrationTokenActivity throws", async () => {
        getById.mockResolvedValue(baseRow());
        jest.mocked(refreshIntegrationTokenActivity).mockRejectedValueOnce(new Error("provider error"));
        const ok = await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, { integrationRepository: { getById }, runRefresh });
        expect(ok).toBe(true);
        expect(runRefresh).not.toHaveBeenCalled();
    });
});

describe("refreshTokenWorkflow / Flowcraft testing utilities", () => {
    const getById = jest.fn<Promise<IntegrationRow | null>, [string, string]>();
    const runRefresh = jest.fn<Promise<false | AuthTokenDetails>, [IntegrationRow]>();

    const deps = { integrationRepository: { getById }, runRefresh };

    const initialState = () => ({
        integrationId,
        organizationId: orgId,
        loopShouldContinue: true,
    });

    beforeEach(() => {
        getById.mockReset();
        runRefresh.mockReset();
        jest.mocked(getIntegrationByIdActivity).mockImplementation(async (repo, organizationIdArg, integrationIdArg) =>
            repo.getById(organizationIdArg, integrationIdArg)
        );
        jest.mocked(refreshIntegrationTokenActivity).mockImplementation(async (fn, row) => fn(row));
    });

    it("InMemoryEventLogger records workflow:start and workflow:finish (flight recorder)", async () => {
        const eventLogger = new InMemoryEventLogger();
        getById.mockResolvedValue(null);

        await runRefreshTokenOrchestration({ integrationId, organizationId: orgId }, deps, { eventBus: eventLogger });

        expect(eventLogger.find("workflow:start")).toBeDefined();
        expect(eventLogger.find("workflow:finish")).toBeDefined();
        expect(eventLogger.filter("node:start").length).toBeGreaterThan(0);
    });

    it("runWithTrace completes when the integration row is missing", async () => {
        getById.mockResolvedValue(null);
        const flow = createRefreshTokenFlowBuilder();
        const runtime = new FlowRuntime({ dependencies: deps });

        const result = await runWithTrace(runtime, flow.toBlueprint(), initialState(), {
            functionRegistry: flow.getFunctionRegistry(),
        });

        expect(result.status).toBe("completed");
    });

    it("createStepper walks the graph until completion for a missing row", async () => {
        getById.mockResolvedValue(null);
        const flow = createRefreshTokenFlowBuilder();
        const runtime = new FlowRuntime({ dependencies: deps });

        const stepper = await createStepper(runtime, flow.toBlueprint(), flow.getFunctionRegistry(), initialState());

        let last = null as Awaited<ReturnType<typeof stepper.next>>;
        let guard = 0;
        while (!stepper.isDone() && guard < 25) {
            last = await stepper.next();
            guard++;
        }

        expect(stepper.isDone()).toBe(true);
        expect(last?.status).toBe("completed");
    });
});
