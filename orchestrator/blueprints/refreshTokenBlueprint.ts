import { createFlow, type NodeRegistry, type WorkflowBlueprint } from "flowcraft";
import { beginNode, finishedNode, refreshTokenTickNode } from "../nodes/refreshTokenNodes.js";
import {
    REFRESH_TOKEN_BLUEPRINT_ID,
    REFRESH_TOKEN_BLUEPRINT_VERSION,
    type RefreshTokenFlowContext,
    type RefreshTokenWorkflowDependencies,
} from "./refreshTokenTypes.js";

/**
 * Flowcraft assigns `fn_<hash>` node keys with a process-global counter, so the blueprint and the
 * registry must be produced from the **same** FlowBuilder instance.
 */
type RefreshTokenDistributedArtifacts = {
    blueprint: WorkflowBlueprint;
    registry: NodeRegistry;
};

let distributedArtifacts: RefreshTokenDistributedArtifacts | null = null;

function getRefreshTokenDistributedArtifacts(): RefreshTokenDistributedArtifacts {
    if (distributedArtifacts) return distributedArtifacts;
    const flow = createRefreshTokenFlowBuilder();
    const blueprint = flow.toBlueprint();
    blueprint.metadata = {
        ...blueprint.metadata,
        version: REFRESH_TOKEN_BLUEPRINT_VERSION,
    };
    const registry = Object.fromEntries(flow.getFunctionRegistry().entries());
    distributedArtifacts = { blueprint, registry };
    return distributedArtifacts;
}

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
    return getRefreshTokenDistributedArtifacts().blueprint;
}

/** User node implementations for the worker registry (function nodes use stable `fn_*` keys from the builder). */
export function getRefreshTokenNodeRegistry(): NodeRegistry {
    return getRefreshTokenDistributedArtifacts().registry;
}
