import type { NotificationEmailWorkflowDependencies } from "../blueprints/notificationEmailFlowTypes.js";

/**
 * OpenQuok-style “activity” wrappers for the notification-email workflow.
 *
 * In this codebase, Flowcraft Nodes are the runnable units, and Workers provide runtime dependencies.
 * These helpers exist purely for organization/reuse (shared email send + digest flush behaviors).
 */

export async function sendPlainEmailActivity(
    deps: Pick<NotificationEmailWorkflowDependencies, "acquireSendPlainSlot" | "sendPlain">,
    params: { to: string; subject: string; html: string; replyTo?: string }
): Promise<void> {
    await deps.acquireSendPlainSlot?.();
    await deps.sendPlain(params);
}

export async function flushNotificationDigestActivity(
    deps: Pick<NotificationEmailWorkflowDependencies, "flushAllPendingDigestEmails">
): Promise<void> {
    await deps.flushAllPendingDigestEmails();
}

