import { FlowRuntime, type IEventBus } from "flowcraft";
import { config } from "backend/config/GlobalConfig.js";
import { logger } from "backend/utils/Logger.js";
import { enqueueScheduledSocialPostDistributedRun } from "../adapters/flowcraft-bullmq/scheduled-social-post/enqueueScheduledSocialPostDistributedRun.js";
import { createScheduledSocialPostFlowBuilder } from "../blueprints/scheduledSocialPostBlueprint.js";
import {
    SCHEDULED_SOCIAL_POST_BLUEPRINT_VERSION,
    type ScheduledSocialPostFlowContext,
    type ScheduledSocialPostWorkflowDependencies,
} from "../blueprints/scheduledSocialPostFlowTypes.js";

export {
    SCHEDULED_SOCIAL_POST_BLUEPRINT_ID,
    SCHEDULED_SOCIAL_POST_BLUEPRINT_VERSION,
    type ScheduledSocialPostFlowContext,
    type ScheduledSocialPostWorkflowDependencies,
} from "../blueprints/scheduledSocialPostFlowTypes.js";

export {
    buildScheduledSocialPostBlueprintDistributed,
    createScheduledSocialPostFlowBuilder,
    getScheduledSocialPostNodeRegistry,
} from "../blueprints/scheduledSocialPostBlueprint.js";

export type RunScheduledSocialPostOrchestrationOptions = {
    signal?: AbortSignal;
    eventBus?: IEventBus;
};

/**
 * **API path (BullMQ):** enqueues a delayed `scheduled-social-post` run at publish time. Requires worker + `transport: bullmq`.
 * **In-process (tests / smoke):** pass `workflowDependencies` with a real `publishScheduledGroup` implementation.
 */
export async function runScheduledSocialPostOrchestration(
    input: { organizationId: string; postGroup: string; delayMs?: number },
    workflowDependencies?: ScheduledSocialPostWorkflowDependencies,
    options?: RunScheduledSocialPostOrchestrationOptions
): Promise<boolean> {
    const bull = config.bullmq as { scheduledSocialPost?: { transport?: string; queueName?: string } };
    if (bull.scheduledSocialPost?.transport === "bullmq") {
        try {
            const { enqueued } = await enqueueScheduledSocialPostDistributedRun(input, {
                queueName: bull.scheduledSocialPost.queueName,
            });
            return enqueued;
        } catch (err) {
            logger.warn({
                msg: "[Orchestrator] Failed to enqueue scheduled social post workflow",
                error: err instanceof Error ? err.message : String(err),
                organizationId: input.organizationId,
                postGroup: input.postGroup,
            });
            return false;
        }
    }

    if (!workflowDependencies) {
        return false;
    }

    const runtime = new FlowRuntime<ScheduledSocialPostFlowContext, ScheduledSocialPostWorkflowDependencies>({
        dependencies: workflowDependencies,
        ...(options?.eventBus !== undefined ? { eventBus: options.eventBus } : {}),
    });
    const flow = createScheduledSocialPostFlowBuilder();
    try {
        const result = await flow.run(
            runtime,
            {
                organizationId: input.organizationId,
                postGroup: input.postGroup,
                blueprintVersion: SCHEDULED_SOCIAL_POST_BLUEPRINT_VERSION,
            },
            { signal: options?.signal }
        );
        return result.status === "completed";
    } catch (err) {
        logger.warn({
            msg: "[Orchestrator] scheduled social post flow threw",
            error: err instanceof Error ? err.message : String(err),
            organizationId: input.organizationId,
            postGroup: input.postGroup,
        });
        return false;
    }
}
