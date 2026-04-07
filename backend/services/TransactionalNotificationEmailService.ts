import type { DigestQueueEntry, NotificationEmailType } from "openquok-common";
import { createQueueIoredisClient } from "../connections/bullmq/createQueueIoredis";
import {
    buildNotificationDigestBodyInner,
    buildNotificationDigestSubject,
    buildNotificationEmailDocument,
} from "../emails/notificationTransactionalEmailHtml";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import { logger } from "../utils/Logger";

export type SendPlainJobPayload = {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
};

function shouldSendEmailForMember(
    type: NotificationEmailType,
    sendSuccessEmails: boolean,
    sendFailureEmails: boolean
): boolean {
    if (type === "info") return true;
    if (type === "success") return sendSuccessEmails;
    if (type === "fail") return sendFailureEmails;
    return true;
}

/**
 * Org-scoped HTML email delivery and enqueue for Flowcraft `notification-send-plain` runs.
 * Digest list keys and Redis list ops live under `orchestrator/stores/notificationDigestRedisStore`.
 */
export class TransactionalNotificationEmailService {
    constructor(private readonly organizationRepository: OrganizationRepository) {}

    /**
     * Resolves org members and invokes `deliver` for each recipient that passes preference filters.
     */
    async deliverToOrganizationMembers(params: {
        organizationId: string;
        subject: string;
        htmlBodyInner: string;
        type: NotificationEmailType;
        deliver: (to: string, subject: string, html: string) => Promise<void>;
    }): Promise<void> {
        const members = await this.organizationRepository.listMembersForNotificationEmails(params.organizationId);
        const html = buildNotificationEmailDocument(params.htmlBodyInner);
        for (const m of members) {
            if (!m.email?.trim()) continue;
            if (!shouldSendEmailForMember(params.type, m.sendSuccessEmails, m.sendFailureEmails)) continue;
            await params.deliver(m.email.trim(), params.subject, html);
        }
    }

    /** Enqueues a Flowcraft distributed run that sends one HTML mail via the notification-email worker. */
    async enqueueSendPlainJob(payload: SendPlainJobPayload): Promise<void> {
        const { runNotificationSendPlainOrchestration } = await import("openquok-orchestrator");
        await runNotificationSendPlainOrchestration(payload);
    }

    /**
     * Append one digest line item to Redis (`orchestrator/stores/notificationDigestRedisStore`).
     * Flush scheduling is **not** here: `runNotificationDigestFlushOrchestration` runs on a timer in
     * `orchestrator/worker/runNotificationEmailBullMqWorker.ts`, which enqueues the digest-flush Flowcraft run.
     */
    async appendDigestEntry(organizationId: string, entry: DigestQueueEntry): Promise<void> {
        const { appendNotificationDigestEntry } = await import("openquok-orchestrator");
        const redis = createQueueIoredisClient();
        try {
            await appendNotificationDigestEntry(redis, organizationId, entry);
        } catch (err) {
            logger.warn({
                msg: "[TransactionalNotificationEmail] Failed to append digest entry",
                organizationId,
                error: err instanceof Error ? err.message : String(err),
            });
        } finally {
            await redis.quit();
        }
    }

    /**
     * Send one combined digest mail per drained batch (type `info`). Called from worker after Redis drain.
     */
    async deliverDigestBatch(
        organizationId: string,
        entries: DigestQueueEntry[],
        sendPlain: (to: string, subject: string, html: string) => Promise<void>
    ): Promise<void> {
        const subject = buildNotificationDigestSubject(entries);
        const inner = buildNotificationDigestBodyInner(entries);

        try {
            await this.deliverToOrganizationMembers({
                organizationId,
                subject,
                htmlBodyInner: inner,
                type: "info",
                deliver: async (to, subj, html) => {
                    await sendPlain(to, subj, html);
                },
            });
        } catch (err) {
            logger.error({
                msg: "[TransactionalNotificationEmail] Digest flush delivery failed",
                organizationId,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
}
