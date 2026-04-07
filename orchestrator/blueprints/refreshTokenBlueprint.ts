import { createFlow, type NodeRegistry, type WorkflowBlueprint } from "flowcraft";
import { beginNode, finishedNode, refreshTokenTickNode } from "../nodes/refreshTokenNodes";
import {
    REFRESH_TOKEN_BLUEPRINT_ID,
    REFRESH_TOKEN_BLUEPRINT_VERSION,
    type RefreshTokenFlowContext,
    type RefreshTokenWorkflowDependencies,
} from "./refreshTokenTypes";

/**
 * Fluent blueprint: `begin` enters the loop controller; each iteration runs `tick`.
 * Continuation uses the default property evaluator and the `loopShouldContinue` workflow key (flat state from context.toJSON()).
 * A `break` edge to `finished` is required so the loop controller can terminate the workflow when the condition is false.
 */
export function createRefreshTokenFlowBuilder() {
    return createFlow<RefreshTokenFlowContext, RefreshTokenWorkflowDependencies>(REFRESH_TOKEN_BLUEPRINT_ID)
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
