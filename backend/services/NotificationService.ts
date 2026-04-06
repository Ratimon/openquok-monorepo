import { config } from "../config/GlobalConfig";
import type { NotificationEmailType } from "../data/types/notificationEmailTypes";
import { buildNotificationMessageParagraph } from "../emails/notificationTransactionalEmailHtml";
import { OrganizationForbiddenError } from "../errors/OrganizationError";
import { UserNotFoundError } from "../errors/UserError";
import type { NotificationRepository } from "../repositories/NotificationRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { UserRepository } from "../repositories/UserRepository";
import type { EmailService } from "./EmailService";
import type { TransactionalNotificationEmailService } from "./TransactionalNotificationEmailService";

export type { NotificationEmailType };

export class NotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly userRepository: UserRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly emailService: EmailService,
        private readonly transactionalNotificationEmail: TransactionalNotificationEmailService
    ) {}

    private async requireActiveMember(authUserId: string, organizationId: string): Promise<string> {
        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
        if (!userId) {
            throw new UserNotFoundError(authUserId);
        }
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) {
            throw new OrganizationForbiddenError("You are not a member of this organization");
        }
        return userId;
    }

    async getMainPageCount(authUserId: string, organizationId: string): Promise<{ total: number }> {
        const userId = await this.requireActiveMember(authUserId, organizationId);
        const last = await this.userRepository.getLastReadNotifications(userId);
        const since = last?.lastReadNotifications ?? "1970-01-01T00:00:00.000Z";
        const total = await this.notificationRepository.countSince(organizationId, since);
        return { total };
    }

    async getNotificationList(authUserId: string, organizationId: string): Promise<{
        lastReadNotifications: string | null;
        notifications: Array<{ created_at: string; content: string }>;
    }> {
        const userId = await this.requireActiveMember(authUserId, organizationId);
        const { previousLastRead } = await this.userRepository.advanceLastReadNotifications(userId);
        const notifications = await this.notificationRepository.listRecentForOrg(organizationId, 10);
        return {
            lastReadNotifications: previousLastRead,
            notifications,
        };
    }

    async getNotificationsPaginated(authUserId: string, organizationId: string, page: number) {
        await this.requireActiveMember(authUserId, organizationId);
        const limit = 100;
        const batch = await this.notificationRepository.listPaginated(organizationId, page, limit);
        return { ...batch, page, limit };
    }

    /**
     * Persist an in-app notification and optionally notify members by email (immediate or digest queue).
     * Digest entries are flushed by the notification-email BullMQ worker on an interval.
     */
    async inAppNotification(
        organizationId: string,
        subject: string,
        message: string,
        sendEmail = false,
        digest = false,
        type: NotificationEmailType = "success"
    ): Promise<void> {
        await this.notificationRepository.createNotification(organizationId, message);
        if (!sendEmail || !this.emailService.isEnabled) {
            return;
        }

        const transport =
            (config.bullmq as { notificationEmail?: { transport?: string } }).notificationEmail?.transport ??
            "in_process";

        // Digest mail: append only; the notification-email worker periodically enqueues digest-flush (see
        // `runNotificationDigestFlushOrchestration` / `runNotificationEmailBullMqWorker`).
        if (digest) {
            await this.transactionalNotificationEmail.appendDigestEntry(organizationId, {
                subject,
                message,
                type,
            });
            return;
        }

        const inner = buildNotificationMessageParagraph(message);
        try {
            await this.transactionalNotificationEmail.deliverToOrganizationMembers({
                organizationId,
                subject,
                htmlBodyInner: inner,
                type,
                deliver:
                    transport === "bullmq"
                        ? async (to, subj, html) => {
                              await this.transactionalNotificationEmail.enqueueSendPlainJob({
                                  to,
                                  subject: subj,
                                  html,
                              });
                          }
                        : async (to, subj, html) => {
                              await this.emailService.sendPlain({ to, subject: subj, html });
                          },
            });
        } catch {
            /* best-effort: in-app row already exists */
        }
    }
}
