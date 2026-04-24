import type { NodeContext } from "flowcraft";
import type { IntegrationRow } from "backend/repositories/IntegrationRepository.js";
import type { RefreshTokenFlowContext, RefreshTokenWorkflowDependencies } from "../blueprints/refreshTokenTypes.js";

import { logger } from "backend/utils/Logger.js";
import { getIntegrationByIdActivity, refreshIntegrationTokenActivity } from "../activities/integrationRefreshActivities.js";
import { sleepChunked } from "../sleepChunked.js";

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
export async function refreshTokenTickNode({
    context,
    dependencies,
    signal,
}: NodeContext<RefreshTokenFlowContext, RefreshTokenWorkflowDependencies>): Promise<{ output: { ok: boolean } }> {
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

    let refreshed: Awaited<ReturnType<RefreshTokenWorkflowDependencies["runRefresh"]>>;
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

export async function beginNode(): Promise<{ output: Record<string, never> }> {
    return { output: {} };
}

export async function finishedNode(): Promise<{ output: { done: true } }> {
    return { output: { done: true } };
}
