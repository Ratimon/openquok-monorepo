import type { NodeContext } from "flowcraft";
import type {
    NotificationDigestFlushFlowContext,
    NotificationEmailWorkflowDependencies,
    NotificationSendPlainFlowContext,
} from "../blueprints/notificationEmailFlowTypes";

export async function notificationSendPlainBeginNode(): Promise<{ output: Record<string, never> }> {
    return { output: {} };
}

export async function notificationSendPlainDispatchNode({
    context,
    dependencies,
}: NodeContext<NotificationSendPlainFlowContext, NotificationEmailWorkflowDependencies>): Promise<{
    output: { ok: boolean };
}> {
    const to = (await context.get("to")) as string;
    const subject = (await context.get("subject")) as string;
    const html = (await context.get("html")) as string;
    const replyTo = (await context.get("replyTo")) as string | undefined;
    await dependencies.acquireSendPlainSlot?.();
    await dependencies.sendPlain({ to, subject, html, replyTo });
    return { output: { ok: true } };
}

export async function notificationSendPlainFinishedNode(): Promise<{ output: { done: true } }> {
    return { output: { done: true } };
}

export async function notificationDigestFlushBeginNode(): Promise<{ output: Record<string, never> }> {
    return { output: {} };
}

export async function notificationDigestFlushRunNode({
    dependencies,
}: NodeContext<NotificationDigestFlushFlowContext, NotificationEmailWorkflowDependencies>): Promise<{
    output: { ok: boolean };
}> {
    await dependencies.flushAllPendingDigestEmails();
    return { output: { ok: true } };
}

export async function notificationDigestFlushFinishedNode(): Promise<{ output: { done: true } }> {
    return { output: { done: true } };
}
