import { createFlow, type NodeRegistry, type WorkflowBlueprint } from "flowcraft";
import {
    ScheduledSocialPostBeginNode,
    ScheduledSocialPostFinishedNode,
    ScheduledSocialPostPublishNode,
} from "../nodes/scheduledSocialPostNodes";
import {
    SCHEDULED_SOCIAL_POST_BLUEPRINT_ID,
    SCHEDULED_SOCIAL_POST_BLUEPRINT_VERSION,
    type ScheduledSocialPostFlowContext,
    type ScheduledSocialPostWorkflowDependencies,
} from "./scheduledSocialPostFlowTypes";

/**
 * Flowcraft assigns `fn_<hash>` node keys with a process-global counter, so the blueprint and the
 * registry must be produced from the **same** FlowBuilder instance.
 */
type ScheduledSocialPostDistributedArtifacts = {
    blueprint: WorkflowBlueprint;
    registry: NodeRegistry;
};

let distributedArtifacts: ScheduledSocialPostDistributedArtifacts | null = null;

function getScheduledSocialPostDistributedArtifacts(): ScheduledSocialPostDistributedArtifacts {
    if (distributedArtifacts) return distributedArtifacts;
    const flow = createScheduledSocialPostFlowBuilder();
    const blueprint = flow.toBlueprint();
    blueprint.metadata = { ...blueprint.metadata, version: SCHEDULED_SOCIAL_POST_BLUEPRINT_VERSION };
    const registry = Object.fromEntries(flow.getFunctionRegistry().entries());
    distributedArtifacts = { blueprint, registry };
    return distributedArtifacts;
}

export function createScheduledSocialPostFlowBuilder() {
    return createFlow<ScheduledSocialPostFlowContext, ScheduledSocialPostWorkflowDependencies>(SCHEDULED_SOCIAL_POST_BLUEPRINT_ID)
        .node("ssBegin", ScheduledSocialPostBeginNode)
        .node("ssPublish", ScheduledSocialPostPublishNode)
        .node("ssFinished", ScheduledSocialPostFinishedNode)
        .edge("ssBegin", "ssPublish")
        .edge("ssPublish", "ssFinished");
}

export function buildScheduledSocialPostBlueprintDistributed(): WorkflowBlueprint {
    return getScheduledSocialPostDistributedArtifacts().blueprint;
}

export function getScheduledSocialPostNodeRegistry(): NodeRegistry {
    return getScheduledSocialPostDistributedArtifacts().registry;
}
