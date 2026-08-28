import { config } from "../config/GlobalConfig";
import type { CompanyService } from "./CompanyService";
import type { EmailService } from "./EmailService";
import type { TransactionalNotificationEmailService } from "./TransactionalNotificationEmailService";
import { logger } from "../utils/Logger";

const DEFAULT_SUPPORT_EMAIL = "admin@openquok.com";

export type OpsEmailFeedbackPayload = {
    feedbackType: string;
    url: string;
    description: string;
    email?: string;
    userId?: string;
};

export type OpsEmailAcquisitionSurveyPayload = {
    userEmail?: string;
    userId: string;
    source: string;
    skipped: boolean;
    otherDetail?: string | null;
    organizationId?: string | null;
    utm?: string | null;
    landingUrl?: string | null;
    referrer?: string | null;
    subscriptionId?: string | null;
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function textToHtml(text: string): string {
    return `<pre style="font-family:monospace;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
}

function parseRecipientList(raw: string): string[] {
    return raw
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
}

/**
 * Best-effort internal alerts to the platform support inbox (acquisition survey, feedback, etc.).
 */
export class InternalOpsEmailService {
    constructor(
        private readonly emailService: EmailService,
        private readonly companyService: CompanyService,
        private readonly transactionalNotificationEmail: TransactionalNotificationEmailService
    ) {}

    notifyFeedbackCreated(payload: OpsEmailFeedbackPayload): void {
        const lines = [
            `Type: ${payload.feedbackType}`,
            `URL: ${payload.url}`,
            `Description: ${payload.description}`,
            payload.email ? `Email: ${payload.email}` : null,
            payload.userId ? `User id: ${payload.userId}` : null,
        ].filter((line): line is string => Boolean(line));

        void this.sendOpsAlert({
            subject: "OpenQuok: feedback",
            text: lines.join("\n"),
            replyTo: payload.email,
        });
    }

    notifyAcquisitionSurveySubmitted(payload: OpsEmailAcquisitionSurveyPayload): void {
        const lines = [
            payload.userEmail ? `User email: ${payload.userEmail}` : null,
            `User id: ${payload.userId}`,
            `Skipped: ${payload.skipped ? "yes" : "no"}`,
            `Source: ${payload.source}`,
            payload.otherDetail ? `Other detail: ${payload.otherDetail}` : null,
            payload.organizationId ? `Organization id: ${payload.organizationId}` : null,
            payload.subscriptionId ? `Subscription id: ${payload.subscriptionId}` : null,
            payload.utm ? `UTM: ${payload.utm}` : null,
            payload.landingUrl ? `Landing URL: ${payload.landingUrl}` : null,
            payload.referrer ? `Referrer: ${payload.referrer}` : null,
        ].filter((line): line is string => Boolean(line));

        void this.sendOpsAlert({
            subject: "OpenQuok: acquisition survey",
            text: lines.join("\n"),
            replyTo: payload.userEmail,
        });
    }

    private async resolveRecipients(): Promise<string[]> {
        const override = (config.ops as { alertEmail?: string } | undefined)?.alertEmail?.trim();
        if (override) {
            const parsed = parseRecipientList(override);
            if (parsed.length > 0) return parsed;
        }

        const { SUPPORT_EMAIL } = await this.companyService.getCompanyInformationByProperties([
            "SUPPORT_EMAIL",
        ]);
        const supportEmail = SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
        return [supportEmail];
    }

    private async sendOpsAlert(params: {
        subject: string;
        text: string;
        replyTo?: string;
    }): Promise<void> {
        if (!this.emailService.isEnabled) {
            logger.info({
                msg: "[InternalOpsEmail] Email disabled; skipping ops alert",
                subject: params.subject,
            });
            return;
        }

        const recipients = await this.resolveRecipients();
        if (recipients.length === 0) {
            logger.warn({
                msg: "[InternalOpsEmail] No ops alert recipients configured",
                subject: params.subject,
            });
            return;
        }

        const transport =
            (config.bullmq as { notificationEmail?: { transport?: string } }).notificationEmail
                ?.transport ?? "in_process";
        const html = textToHtml(params.text);
        const replyTo = params.replyTo?.trim() || undefined;

        try {
            for (const to of recipients) {
                if (transport === "bullmq") {
                    await this.transactionalNotificationEmail.enqueueSendPlainJob({
                        to,
                        subject: params.subject,
                        html,
                        replyTo,
                    });
                } else {
                    await this.emailService.sendPlain({
                        to,
                        subject: params.subject,
                        text: params.text,
                        html,
                        replyTo,
                    });
                }
            }
        } catch (err) {
            logger.warn({
                msg: "[InternalOpsEmail] Ops alert email failed",
                subject: params.subject,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
}
