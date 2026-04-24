import { BaseNode, type NodeContext } from "flowcraft";
import type { ScheduledSocialPostFlowContext, ScheduledSocialPostWorkflowDependencies } from "../blueprints/scheduledSocialPostFlowTypes";
import { logger } from "backend/utils/Logger.js";

export class ScheduledSocialPostBeginNode extends BaseNode {
    async exec(): Promise<{ output: Record<string, never> }> {
        return { output: {} };
    }
}

/**
 * Token refresh and retries are handled inside `publishScheduledGroup` (orchestrator activity).
 */
export class ScheduledSocialPostPublishNode extends BaseNode {
    async exec(
        _input: unknown,
        { context, dependencies, signal: abort }: NodeContext<
            ScheduledSocialPostFlowContext,
            ScheduledSocialPostWorkflowDependencies
        >
    ): Promise<{ output: { ok: boolean } }> {
        const organizationId = (await context.get("organizationId")) as string;
        const postGroup = (await context.get("postGroup")) as string;
        try {
            if (abort?.aborted) {
                return { output: { ok: false } };
            }
            await dependencies.publishScheduledGroup({ organizationId, postGroup });
        } catch (err) {
            logger.warn({
                msg: "[Orchestrator] scheduled social post publishGroup failed",
                organizationId,
                postGroup,
                error: err instanceof Error ? err.message : String(err),
            });
            throw err;
        }
        return { output: { ok: true } };
    }
}

export class ScheduledSocialPostFinishedNode extends BaseNode {
    async exec(): Promise<{ output: { done: true } }> {
        return { output: { done: true } };
    }
}
