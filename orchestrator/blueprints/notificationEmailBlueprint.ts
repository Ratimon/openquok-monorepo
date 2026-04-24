import { createFlow, type NodeRegistry, type WorkflowBlueprint } from "flowcraft";
import {
    notificationDigestFlushBeginNode,
    notificationDigestFlushFinishedNode,
    notificationDigestFlushRunNode,
    notificationSendPlainBeginNode,
    notificationSendPlainDispatchNode,
    notificationSendPlainFinishedNode,
} from "../nodes/notificationEmailNodes.js";
import {
    NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_ID,
    NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_VERSION,
    NOTIFICATION_SEND_PLAIN_BLUEPRINT_ID,
    NOTIFICATION_SEND_PLAIN_BLUEPRINT_VERSION,
    type NotificationDigestFlushFlowContext,
    type NotificationEmailWorkflowDependencies,
    type NotificationSendPlainFlowContext,
} from "./notificationEmailFlowTypes.js";

/**
 * Flowcraft assigns `fn_<hash>` node keys with a process-global counter (`flowcraft` ` _hashFunction`),
 * so the same function gets different `uses` values depending on how many `node()` calls ran first.
 * Distributed runs and the worker must share one materialization: same two FlowBuilder instances
 * in **send-plain then digest** order, one merged registry, and blueprints from those instances.
 */
type NotificationEmailDistributedArtifacts = {
    mergedRegistry: NodeRegistry;
    sendPlainBlueprint: WorkflowBlueprint;
    digestFlushBlueprint: WorkflowBlueprint;
};

let distributedArtifacts: NotificationEmailDistributedArtifacts | null = null;

function getNotificationEmailDistributedArtifacts(): NotificationEmailDistributedArtifacts {
    if (distributedArtifacts) return distributedArtifacts;
    const sendB = createNotificationSendPlainFlowBuilder();
    const digestB = createNotificationDigestFlushFlowBuilder();
    const mergedRegistry = Object.fromEntries([
        ...sendB.getFunctionRegistry().entries(),
        ...digestB.getFunctionRegistry().entries(),
    ]);
    const sendPlainBlueprint = sendB.toBlueprint();
    sendPlainBlueprint.metadata = {
        ...sendPlainBlueprint.metadata,
        version: NOTIFICATION_SEND_PLAIN_BLUEPRINT_VERSION,
    };
    const digestFlushBlueprint = digestB.toBlueprint();
    digestFlushBlueprint.metadata = {
        ...digestFlushBlueprint.metadata,
        version: NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_VERSION,
    };
    distributedArtifacts = { mergedRegistry, sendPlainBlueprint, digestFlushBlueprint };
    return distributedArtifacts;
}

export function createNotificationSendPlainFlowBuilder() {
    return createFlow<NotificationSendPlainFlowContext, NotificationEmailWorkflowDependencies>(
        NOTIFICATION_SEND_PLAIN_BLUEPRINT_ID
    )
        .node("spBegin", notificationSendPlainBeginNode)
        .node("spDispatch", notificationSendPlainDispatchNode)
        .node("spFinished", notificationSendPlainFinishedNode)
        .edge("spBegin", "spDispatch")
        .edge("spDispatch", "spFinished");
}

export function buildNotificationSendPlainBlueprintDistributed(): WorkflowBlueprint {
    return getNotificationEmailDistributedArtifacts().sendPlainBlueprint;
}

export function createNotificationDigestFlushFlowBuilder() {
    return createFlow<NotificationDigestFlushFlowContext, NotificationEmailWorkflowDependencies>(
        NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_ID
    )
        .node("dfBegin", notificationDigestFlushBeginNode)
        .node("dfFlush", notificationDigestFlushRunNode)
        .node("dfFinished", notificationDigestFlushFinishedNode)
        .edge("dfBegin", "dfFlush")
        .edge("dfFlush", "dfFinished");
}

export function buildNotificationDigestFlushBlueprintDistributed(): WorkflowBlueprint {
    return getNotificationEmailDistributedArtifacts().digestFlushBlueprint;
}

/** Merged function-node registry for both notification-email blueprints (single BullMQ worker). */
export function getNotificationEmailNodeRegistry(): NodeRegistry {
    return getNotificationEmailDistributedArtifacts().mergedRegistry;
}
