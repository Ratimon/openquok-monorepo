import {
    createFlow,
    FlowRuntime,
    type IEventBus,
    type NodeContext,
    type NodeRegistry,
    type WorkflowBlueprint,
} from "flowcraft";
import type { AuthTokenDetails } from "../../integrations/social.integrations.interface";
import type { IntegrationRepository, IntegrationRow } from "../../repositories/IntegrationRepository";
import { config } from "../../config/GlobalConfig";
import { logger } from "../../utils/Logger";
import { enqueueRefreshTokenDistributedRun } from "../bullmq/enqueueRefreshTokenDistributedRun";
import { getIntegrationByIdActivity, refreshIntegrationTokenActivity } from "../activities/integrationRefreshActivities";
import { sleepChunked } from "../sleepChunked";

/** Matches `createFlow("refresh-token")` id; used as BullMQ `blueprintId`. */
export const REFRESH_TOKEN_BLUEPRINT_ID = "refresh-token";

/** Bump when the refresh-token graph changes so distributed workers reject mismatched runs. */
export const REFRESH_TOKEN_BLUEPRINT_VERSION = "1.0.0";

export type RefreshTokenOrchestrationDeps = {
    integrationRepository: Pick<IntegrationRepository, "getById">;
    runRefresh: (row: IntegrationRow) => Promise<false | AuthTokenDetails>;
};

type RefreshTokenFlowContext = {
    integrationId: string;
    organizationId: string;
    loopShouldContinue: boolean;
};

function integrationShouldExit(row: IntegrationRow | null): boolean {
    if (!row) {
        return true;
    }
    if (row.deleted_at) {
        return true;
    }
    if (row.in_between_steps) {
        return true;
    }
    if (row.refresh_needed) {
        return true;
    }
    return false;
}

/**
 * One iteration: load integration, sleep until token expiry, re-validate, refresh tokens.
 * Matches the long-running refresh supervisor pattern (sleep-until-expiry then refresh), expressed as the body of a Flowcraft loop.
 */
async function refreshTokenTickNode({
    context,
    dependencies,
    signal,
}: NodeContext<RefreshTokenFlowContext, RefreshTokenOrchestrationDeps>): Promise<{ output: { ok: boolean } }> {
    const { integrationRepository, runRefresh } = dependencies;
    const organizationId = (await context.get("organizationId")) as string;
    const integrationId = (await context.get("integrationId")) as string;

    let row: IntegrationRow | null;
    try {
        row = await getIntegrationByIdActivity(integrationRepository, organizationId, integrationId, signal);
    } catch {
        await context.set("loopShouldContinue", false);
        return { output: { ok: false } };
    }
    if (integrationShouldExit(row)) {
        await context.set("loopShouldContinue", false);
        return { output: { ok: false } };
    }

    const active = row as IntegrationRow;
    if (!active.token_expiration) {
        await context.set("loopShouldContinue", false);
        return { output: { ok: false } };
    }

    const endDate = new Date(active.token_expiration);
    const ms = Math.max(0, endDate.getTime() - Date.now());
    if (ms === 0) {
        await context.set("loopShouldContinue", false);
        return { output: { ok: false } };
    }

    await sleepChunked(ms, signal);

    try {
        row = await getIntegrationByIdActivity(integrationRepository, organizationId, integrationId, signal);
    } catch {
        await context.set("loopShouldContinue", false);
        return { output: { ok: false } };
    }
    if (integrationShouldExit(row)) {
        await context.set("loopShouldContinue", false);
        return { output: { ok: false } };
    }

    let refreshed: false | AuthTokenDetails;
    try {
        refreshed = await refreshIntegrationTokenActivity(runRefresh, row as IntegrationRow, signal);
    } catch {
        await context.set("loopShouldContinue", false);
        return { output: { ok: false } };
    }
    if (!refreshed) {
        await context.set("loopShouldContinue", false);
        return { output: { ok: false } };
    }

    await context.set("loopShouldContinue", true);
    logger.debug({
        msg: "[Orchestrator] refresh-token tick completed",
        integrationId,
        organizationId,
    });
    return { output: { ok: true } };
}

async function beginNode(): Promise<{ output: Record<string, never> }> {
    return { output: {} };
}

async function finishedNode(): Promise<{ output: { done: true } }> {
    return { output: { done: true } };
}

/**
 * Fluent blueprint: `begin` enters the loop controller; each iteration runs `tick`.
 * Continuation uses the default property evaluator and the `loopShouldContinue` workflow key (flat state from context.toJSON()).
 * A `break` edge to `finished` is required so the loop controller can terminate the workflow when the condition is false.
 */
export function createRefreshTokenFlowBuilder() {
    return createFlow<RefreshTokenFlowContext, RefreshTokenOrchestrationDeps>("refresh-token")
        .node("begin", beginNode)
        .node("tick", refreshTokenTickNode)
        .node("finished", finishedNode)
        .loop("refreshCycle", {
            startNodeId: "tick",
            endNodeId: "tick",
            condition: "loopShouldContinue",
        })
        .edge("begin", "refreshCycle")
        .edge("refreshCycle", "finished", { action: "break" });
}

/** Blueprint + version metadata for BullMQ / distributed execution. */
export function buildRefreshTokenBlueprintDistributed(): WorkflowBlueprint {
    const blueprint = createRefreshTokenFlowBuilder().toBlueprint();
    blueprint.metadata = {
        ...blueprint.metadata,
        version: REFRESH_TOKEN_BLUEPRINT_VERSION,
    };
    return blueprint;
}

/** User node implementations for the worker registry (function nodes use stable `fn_*` keys from the builder). */
export function getRefreshTokenNodeRegistry(): NodeRegistry {
    return Object.fromEntries(createRefreshTokenFlowBuilder().getFunctionRegistry());
}

/**
 * Runs the in-process refresh supervisor until the integration no longer qualifies or refresh fails.
 * Not durable across API restarts (unlike an external workflow engine); call sites should fire-and-forget.
 */
export async function runRefreshTokenOrchestration(
    input: { integrationId: string; organizationId: string },
    deps: RefreshTokenOrchestrationDeps,
    options?: { signal?: AbortSignal; eventBus?: IEventBus }
): Promise<boolean> {
    const bullmqSection = config.bullmq as {
        integrationRefresh?: { transport?: string };
        queueName?: string;
    };
    const refreshOrch = bullmqSection.integrationRefresh;

    if (refreshOrch?.transport === "bullmq") {
        try {
            const { enqueued } = await enqueueRefreshTokenDistributedRun(input, {
                queueName: bullmqSection.queueName,
            });
            return enqueued;
        } catch (err) {
            logger.warn({
                msg: "[Orchestrator] Failed to enqueue distributed refresh-token workflow",
                error: err instanceof Error ? err.message : String(err),
                integrationId: input.integrationId,
                organizationId: input.organizationId,
            });
            return false;
        }
    }

    const runtime = new FlowRuntime<RefreshTokenFlowContext, RefreshTokenOrchestrationDeps>({
        dependencies: deps,
        ...(options?.eventBus !== undefined ? { eventBus: options.eventBus } : {}),
    });
    const flow = createRefreshTokenFlowBuilder();
    try {
        const result = await flow.run(
            runtime,
            {
                integrationId: input.integrationId,
                organizationId: input.organizationId,
                loopShouldContinue: true,
            },
            { signal: options?.signal }
        );
        return result.status === "completed";
    } catch (err) {
        logger.warn({
            msg: "[Orchestrator] refresh-token flow threw",
            error: err instanceof Error ? err.message : String(err),
            integrationId: input.integrationId,
            organizationId: input.organizationId,
        });
        return false;
    }
}
