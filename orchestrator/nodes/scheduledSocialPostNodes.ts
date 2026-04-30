import { BaseNode, type NodeContext } from "flowcraft";
import type {
    ScheduledSocialPostFlowContext,
    ScheduledSocialPostTodo,
    ScheduledSocialPostWorkflowDependencies,
} from "../blueprints/scheduledSocialPostFlowTypes";
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
    ): Promise<{ output: { ok: boolean; todos: ScheduledSocialPostTodo[] } }> {
        const organizationId = (await context.get("organizationId")) as string;
        const postGroup = (await context.get("postGroup")) as string;
        try {
            if (abort?.aborted) {
                return { output: { ok: false, todos: [] } };
            }
            const res = await dependencies.publishScheduledGroup({ organizationId, postGroup });
            const todos = (res && typeof res === "object" && Array.isArray((res as { todos?: unknown }).todos)
                ? ((res as { todos: ScheduledSocialPostTodo[] }).todos ?? [])
                : []) as ScheduledSocialPostTodo[];
            return { output: { ok: true, todos } };
        } catch (err) {
            logger.warn({
                msg: "[Orchestrator] scheduled social post publishGroup failed",
                organizationId,
                postGroup,
                error: err instanceof Error ? err.message : String(err),
            });
            throw err;
        }
    }
}

export class ScheduledSocialPostRepeatNode extends BaseNode {
    async exec(
        input: { ok?: boolean; todos?: ScheduledSocialPostTodo[] } | undefined,
        { context, dependencies }: NodeContext<ScheduledSocialPostFlowContext, ScheduledSocialPostWorkflowDependencies>
    ): Promise<{ output: { startedRepeatChildren: number } }> {
        const organizationId = (await context.get("organizationId")) as string;
        const todos = Array.isArray(input?.todos) ? input!.todos! : [];
        const repeat = todos.filter((t) => t?.type === "repeat-post") as ScheduledSocialPostTodo[];

        if (repeat.length === 0) {
            return { output: { startedRepeatChildren: 0 } };
        }

        if (typeof dependencies.startChildScheduledSocialPost !== "function") {
            logger.warn({
                msg: "[Orchestrator] scheduled social post repeat todo present but startChildScheduledSocialPost is not configured; skipping child starts",
                organizationId,
                repeatCount: repeat.length,
            });
            return { output: { startedRepeatChildren: 0 } };
        }

        let started = 0;
        for (const todo of repeat) {
            const delayMs = typeof todo.delayMs === "number" ? todo.delayMs : undefined;
            try {
                // Fire-and-forget: do not await in graph terms; only await the enqueue call.
                await dependencies.startChildScheduledSocialPost({
                    organizationId,
                    postGroup: todo.postGroup,
                    delayMs,
                });
                started++;
            } catch (err) {
                logger.warn({
                    msg: "[Orchestrator] Failed to start child scheduled social post workflow (repeat-post)",
                    organizationId,
                    postGroup: todo.postGroup,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }

        return { output: { startedRepeatChildren: started } };
    }
}

export class ScheduledSocialPostFinishedNode extends BaseNode {
    async exec(): Promise<{ output: { done: true } }> {
        return { output: { done: true } };
    }
}
