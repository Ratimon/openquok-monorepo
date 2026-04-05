import { createFlow, FlowRuntime, type NodeContext } from "flowcraft";
import type { AuthTokenDetails } from "../../integrations/social.integrations.interface";
import type { IntegrationRepository, IntegrationRow } from "../../repositories/IntegrationRepository";
import { logger } from "../../utils/Logger";
import { getIntegrationByIdActivity, refreshIntegrationTokenActivity } from "../activities/integrationRefreshActivities";
import { sleepChunked } from "../sleepChunked";

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

/**
 * Runs the in-process refresh supervisor until the integration no longer qualifies or refresh fails.
 * Not durable across API restarts (unlike an external workflow engine); call sites should fire-and-forget.
 */
export async function runRefreshTokenOrchestration(
    input: { integrationId: string; organizationId: string },
    deps: RefreshTokenOrchestrationDeps,
    options?: { signal?: AbortSignal }
): Promise<boolean> {
    const runtime = new FlowRuntime<RefreshTokenFlowContext, RefreshTokenOrchestrationDeps>({
        dependencies: deps,
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
