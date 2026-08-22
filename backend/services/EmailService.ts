import type { SESv2ClientConfig } from "@aws-sdk/client-sesv2";
import type { AbstractEmailTemplate } from "../emails/AbstractEmailTemplate";

import { randomBytes, createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { config } from "../config/GlobalConfig";
import { AppError } from "../errors/AppError";
import { logger } from "../utils/Logger";

const RESEND_API_BASE = "https://api.resend.com";
const RESEND_USER_AGENT = "openquok-backend/1.0";

/** Summary row from [List Receiving Emails](https://resend.com/docs/api-reference/emails/list-received-emails). */
export interface ResendReceivedEmailSummary {
    id: string;
    to: string[];
    from: string;
    created_at: string;
    subject: string;
    bcc: string[];
    cc: string[];
    reply_to: string[];
    message_id: string;
    attachments: Array<{
        filename: string;
        content_type: string;
        content_id: string | null;
        content_disposition: string;
        id: string;
        size: number;
    }>;
}

export interface ResendListReceivedEmailsResponse {
    object: "list";
    has_more: boolean;
    data: ResendReceivedEmailSummary[];
}

export type ResendReceivedEmailDetail = Record<string, unknown>;

const emailConfig = config.email as { enabled?: boolean } | undefined;
const serverConfig = config.server as {
    nodeEnv?: string;
    isEmailServerOffline?: boolean;
};
const basicConfig = config.basic as { siteName?: string; senderEmailAddress?: string };
const awsConfig = config.aws as { accessKeyId?: string; secretAccessKey?: string };
const resendConfig = config.resend as { secretKey?: string };

function formatFromAddress(): string {
    const name = basicConfig?.siteName ?? "OpenQuok";
    const address = basicConfig?.senderEmailAddress ?? "noreply@example.com";
    return `${name} <${address}>`;
}

function toEmailList(value: string | string[]): string[] {
    return (Array.isArray(value) ? value : [value]).map((v) => v.trim()).filter(Boolean);
}

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    public readonly isEnabled: boolean;

    constructor(options?: { isEnabled?: boolean }) {
        this.isEnabled = options?.isEnabled ?? emailConfig?.enabled ?? false;

        if (!this.isEnabled) return;

        const isProduction = serverConfig?.nodeEnv === "production";

        // Prefer Resend HTTPS (`POST /emails`) when configured — avoids outbound SMTP :465,
        // which is often blocked on PaaS (e.g. Railway). Receiving already uses the same API host.
        if (resendConfig?.secretKey) {
            logger.info({
                msg: "[Email] Using Resend HTTPS API for outbound mail",
                base: RESEND_API_BASE,
            });
            return;
        }

        if (isProduction) {
            logger.warn({ msg: "Email enabled but RESEND_SECRET_KEY not set; emails will not be sent." });
            return;
        }

        const useLocalSes =
            serverConfig?.isEmailServerOffline === true ||
            (awsConfig?.accessKeyId === "local" && awsConfig?.secretAccessKey === "local");

        let sesOptions: SESv2ClientConfig = {
            region: "ap-southeast-1",
            apiVersion: "2019-09-27",
            credentials: {
                accessKeyId: awsConfig?.accessKeyId ?? "",
                secretAccessKey: awsConfig?.secretAccessKey ?? "",
            },
        };

        if (useLocalSes) {
            sesOptions = {
                region: "aws-ses-v2-local",
                apiVersion: "2019-09-27",
                endpoint: "http://127.0.0.1:8005",
                credentials: {
                    accessKeyId: awsConfig?.accessKeyId ?? "local",
                    secretAccessKey: awsConfig?.secretAccessKey ?? "local",
                },
            };
            logger.info({ msg: "[Email] Using local SES mock", endpoint: "http://127.0.0.1:8005" });
        }

        if (awsConfig?.accessKeyId && awsConfig?.secretAccessKey) {
            const sesClient = new SESv2Client(sesOptions);
            this.transporter = nodemailer.createTransport({
                SES: {
                    sesClient,
                    SendEmailCommand,
                },
            } as Parameters<typeof nodemailer.createTransport>[0]);
        } else {
            logger.warn({
                msg: "Email enabled but neither AWS credentials nor RESEND_SECRET_KEY are set; emails will not be sent.",
            });
        }
    }

    private get hasOutboundTransport(): boolean {
        return this.isResendApiConfigured || this.transporter !== null;
    }

    /**
     * Send an email using the given template. No-op when isEnabled is false or transport is not configured.
     */
    async send(template: AbstractEmailTemplate, to: string): Promise<void> {
        if (!this.isEnabled) return;
        if (!this.hasOutboundTransport) {
            logger.info({
                msg: "Email (skipped – no transport)",
                to,
                subject: template.buildSubject(),
            });
            return;
        }

        try {
            await this.dispatchMail({
                to,
                subject: template.buildSubject(),
                html: template.buildHtml(),
            });
        } catch (err) {
            logger.error({ msg: "Email send failed", to, err });
            throw err;
        }
    }

    /**
     * Send a plain (non-template) email using the same transport path as transactional templates.
     * This keeps sender identity + transport consistent for deliverability.
     */
    async sendPlain(options: {
        to: string | string[];
        subject: string;
        text?: string;
        html?: string;
        replyTo?: string | string[];
        headers?: Record<string, string>;
    }): Promise<void> {
        if (!this.isEnabled) {
            throw new AppError("Email is disabled", 503);
        }
        if (!this.hasOutboundTransport) {
            throw new AppError("Email transport is not configured", 503);
        }
        if (!options.text && !options.html) {
            throw new AppError("Provide at least one of text or html", 400);
        }

        try {
            await this.dispatchMail(options);
        } catch (err) {
            logger.error({ msg: "Email send failed", to: options.to, err });
            throw err;
        }
    }

    private async dispatchMail(options: {
        to: string | string[];
        subject: string;
        text?: string;
        html?: string;
        replyTo?: string | string[];
        headers?: Record<string, string>;
    }): Promise<void> {
        if (this.isResendApiConfigured) {
            await this.sendViaResendHttps(options);
            return;
        }

        if (!this.transporter) {
            throw new AppError("Email transport is not configured", 503);
        }

        await this.transporter.sendMail({
            from: {
                name: basicConfig?.siteName ?? "OpenQuok",
                address: basicConfig?.senderEmailAddress ?? "noreply@example.com",
            },
            to: options.to,
            subject: options.subject,
            ...(options.text ? { text: options.text } : {}),
            ...(options.html ? { html: options.html } : {}),
            ...(options.replyTo ? { replyTo: options.replyTo } : {}),
            ...(options.headers ? { headers: options.headers } : {}),
        });
    }

    /** Outbound send via Resend REST (`POST /emails`) — works where SMTP :465 is blocked. */
    private async sendViaResendHttps(options: {
        to: string | string[];
        subject: string;
        text?: string;
        html?: string;
        replyTo?: string | string[];
        headers?: Record<string, string>;
    }): Promise<void> {
        const apiKey = resendConfig?.secretKey;
        if (!apiKey) {
            throw new AppError("Resend API key is not configured", 503);
        }

        const to = toEmailList(options.to);
        if (to.length === 0) {
            throw new AppError("At least one recipient is required", 400);
        }

        const replyList = options.replyTo ? toEmailList(options.replyTo) : [];
        const body: Record<string, unknown> = {
            from: formatFromAddress(),
            to,
            subject: options.subject,
        };
        if (options.html) body.html = options.html;
        if (options.text) body.text = options.text;
        if (replyList.length === 1) body.reply_to = replyList[0];
        else if (replyList.length > 1) body.reply_to = replyList;
        if (options.headers && Object.keys(options.headers).length > 0) {
            body.headers = options.headers;
        }

        const res = await fetch(`${RESEND_API_BASE}/emails`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "User-Agent": RESEND_USER_AGENT,
            },
            body: JSON.stringify(body),
        });

        await this.parseResendJson<{ id: string }>(res);
    }

    generateVerificationToken(): string {
        return randomBytes(32).toString("hex");
    }

    hashToken(token: string): string {
        return createHash("sha256").update(token).digest("hex");
    }

    /** True when `RESEND_SECRET_KEY` is set (used for Resend REST API, send + receiving). */
    get isResendApiConfigured(): boolean {
        return Boolean(resendConfig?.secretKey);
    }

    /**
     * List received emails via Resend API ([pagination](https://resend.com/docs/api-reference/pagination)).
     * Omit `limit` to return all items in one response when the endpoint allows it.
     */
    async listReceivedEmails(params: {
        limit?: number;
        after?: string;
        before?: string;
    }): Promise<ResendListReceivedEmailsResponse> {
        const apiKey = resendConfig?.secretKey;
        if (!apiKey) {
            throw new AppError("Resend API key is not configured", 503);
        }

        const searchParams = new URLSearchParams();
        if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
        if (params.after) searchParams.set("after", params.after);
        if (params.before) searchParams.set("before", params.before);

        const query = searchParams.toString();
        const url = `${RESEND_API_BASE}/emails/receiving${query ? `?${query}` : ""}`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "User-Agent": RESEND_USER_AGENT,
            },
        });

        return this.parseResendJson<ResendListReceivedEmailsResponse>(res);
    }

    /** Fetch one received email by id ([Retrieve Received Email](https://resend.com/docs/api-reference/emails/retrieve-received-email)). */
    async getReceivedEmail(id: string): Promise<ResendReceivedEmailDetail> {
        const apiKey = resendConfig?.secretKey;
        if (!apiKey) {
            throw new AppError("Resend API key is not configured", 503);
        }

        const url = `${RESEND_API_BASE}/emails/receiving/${encodeURIComponent(id)}`;
        const res = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "User-Agent": RESEND_USER_AGENT,
            },
        });

        return this.parseResendJson<ResendReceivedEmailDetail>(res);
    }

    private async parseResendJson<T>(res: Response): Promise<T> {
        const text = await res.text();
        let body: unknown;
        try {
            body = text ? JSON.parse(text) : {};
        } catch {
            throw new AppError("Invalid response from Resend API", res.status || 502, {
                cause: new Error(`Non-JSON body (status ${res.status})`),
            });
        }

        if (!res.ok) {
            const errBody = body as { message?: string; name?: string; statusCode?: number };
            const message =
                typeof errBody.message === "string" ? errBody.message : `Resend API error (${res.status})`;
            const status =
                typeof errBody.statusCode === "number" && errBody.statusCode >= 400 && errBody.statusCode < 600
                    ? errBody.statusCode
                    : res.status >= 400
                      ? res.status
                      : 502;
            throw new AppError(message, status, {
                metadata: errBody.name ? { resendErrorName: errBody.name } : {},
            });
        }

        return body as T;
    }
}
