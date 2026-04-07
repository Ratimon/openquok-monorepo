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
    const blueprint = createNotificationSendPlainFlowBuilder().toBlueprint();
    blueprint.metadata = {
        ...blueprint.metadata,
        version: NOTIFICATION_SEND_PLAIN_BLUEPRINT_VERSION,
    };
    return blueprint;
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
    const blueprint = createNotificationDigestFlushFlowBuilder().toBlueprint();
    blueprint.metadata = {
        ...blueprint.metadata,
        version: NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_VERSION,
    };
    return blueprint;
}

/** Merged function-node registry for both notification-email blueprints (single BullMQ worker). */
export function getNotificationEmailNodeRegistry(): NodeRegistry {
    const sendPlain = createNotificationSendPlainFlowBuilder().getFunctionRegistry();
    const digest = createNotificationDigestFlushFlowBuilder().getFunctionRegistry();
    return Object.fromEntries([...sendPlain.entries(), ...digest.entries()]);
}
