import type { SESv2ClientConfig } from "@aws-sdk/client-sesv2";
import type { AbstractEmailTemplate } from "../emails/AbstractEmailTemplate";

import { randomBytes, createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { config } from "../config/GlobalConfig";
import { logger } from "../utils/Logger";

const emailConfig = config.email as { enabled?: boolean } | undefined;
const serverConfig = config.server as {
    nodeEnv?: string;
    isEmailServerOffline?: boolean;
};
const basicConfig = config.basic as { siteName?: string; senderEmailAddress?: string };
const awsConfig = config.aws as { accessKeyId?: string; secretAccessKey?: string };
const resendConfig = config.resend as { secretKey?: string };

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    public readonly isEnabled: boolean;

    constructor(options?: { isEnabled?: boolean }) {
        this.isEnabled = options?.isEnabled ?? emailConfig?.enabled ?? false;

        if (!this.isEnabled) return;

        const isProduction = serverConfig?.nodeEnv === "production";

        if (isProduction) {
            if (resendConfig?.secretKey) {
                this.transporter = nodemailer.createTransport({
                    host: "smtp.resend.com",
                    secure: true,
                    port: 465,
                    auth: {
                        user: "resend",
                        pass: resendConfig.secretKey,
                    },
                });
            } else {
                logger.warn({ msg: "Email enabled but RESEND_SECRET_KEY not set; emails will not be sent." });
            }
        } else {
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
                    msg: "Email enabled but AWS credentials not set; emails will not be sent.",
                });
            }
        }
    }

    /**
     * Send an email using the given template. No-op when isEnabled is false or transport is not configured.
     */
    async send(template: AbstractEmailTemplate, to: string): Promise<void> {
        if (!this.isEnabled) return;
        if (!this.transporter) {
            logger.info({
                msg: "Email (skipped – no transport)",
                to,
                subject: template.buildSubject(),
            });
            return;
        }

        try {
            await this.transporter.sendMail({
                from: {
                    name: basicConfig?.siteName ?? "Content OS",
                    address: basicConfig?.senderEmailAddress ?? "noreply@example.com",
                },
                to,
                subject: template.buildSubject(),
                html: template.buildHtml(),
            });
        } catch (err) {
            logger.error({ msg: "Email send failed", to, err });
            throw err;
        }
    }

    generateVerificationToken(): string {
        return randomBytes(32).toString("hex");
    }

    hashToken(token: string): string {
        return createHash("sha256").update(token).digest("hex");
    }
}
