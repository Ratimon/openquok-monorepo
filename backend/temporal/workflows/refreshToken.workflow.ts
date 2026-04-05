import { proxyActivities } from "@temporalio/workflow";
import type { RefreshActivities } from "../activityTypes";

const { ping } = proxyActivities<RefreshActivities>({
    startToCloseTimeout: "1 minute",
});

/**
 * Token refresh orchestration (Temporal). First version: smoke-test path (ping activity only).
 * Extend with sleep + refresh activities when wiring DB and providers.
 */
export async function refreshTokenWorkflow(input: {
    integrationId: string;
    organizationId: string;
}): Promise<{ ok: boolean }> {
    await ping(input);
    return { ok: true };
}
