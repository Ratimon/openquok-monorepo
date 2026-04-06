import { FlowRuntime, type IEventBus } from "flowcraft";
import { config } from "../../config/GlobalConfig";
import { logger } from "../../utils/Logger";
import { enqueueRefreshTokenDistributedRun } from "../adapters/flowcraft-bullmq/enqueueRefreshTokenDistributedRun";
import { createRefreshTokenFlowBuilder } from "../blueprints/refreshTokenBlueprint";
import type { RefreshTokenFlowContext, RefreshTokenWorkflowDependencies } from "../blueprints/refreshTokenTypes";

export {
    REFRESH_TOKEN_BLUEPRINT_ID,
    REFRESH_TOKEN_BLUEPRINT_VERSION,
    type RefreshTokenFlowContext,
    type RefreshTokenWorkflowDependencies,
} from "../blueprints/refreshTokenTypes";

/** Optional `runRefreshTokenOrchestration` controls (cancellation, test event bus). */
export type RunRefreshTokenOrchestrationOptions = {
    signal?: AbortSignal;
    eventBus?: IEventBus;
};

export {
    createRefreshTokenFlowBuilder,
    buildRefreshTokenBlueprintDistributed,
    getRefreshTokenNodeRegistry,
} from "../blueprints/refreshTokenBlueprint";

/**
 * Runs the in-process refresh supervisor until the integration no longer qualifies or refresh fails.
 * Not durable across API restarts (unlike an external workflow engine); call sites should fire-and-forget.
 */
export async function runRefreshTokenOrchestration(
    input: { integrationId: string; organizationId: string },
    workflowDependencies: RefreshTokenWorkflowDependencies,
    options?: RunRefreshTokenOrchestrationOptions
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

    const runtime = new FlowRuntime<RefreshTokenFlowContext, RefreshTokenWorkflowDependencies>({
        dependencies: workflowDependencies,
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
