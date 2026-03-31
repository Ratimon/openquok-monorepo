import type { NextFunction, Request, Response } from "express";
import type { SendEmailRequestBody } from "../data/schemas/emailSchemas";
import type { ParsedListReceivedEmailsQuery } from "../middlewares/queryParsers";
import type { EmailService } from "../services/EmailService";

export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    /**
     * Expects req.parsedQuery (ParsedListReceivedEmailsQuery) from createListReceivedEmailsParser middleware.
     */
    listReceivedEmails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!this.emailService.isResendApiConfigured) {
                res.status(503).json({
                    success: false,
                    message: "Resend API key is not configured",
                });
                return;
            }

            const parsedQuery = (req as Request & { parsedQuery?: ParsedListReceivedEmailsQuery }).parsedQuery;
            const opts = parsedQuery ?? {};
            const data = await this.emailService.listReceivedEmails({
                limit: opts.limit,
                after: opts.after ?? undefined,
                before: opts.before ?? undefined,
            });

            res.status(200).json({
                success: true,
                data,
                message: "Received emails listed successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    getReceivedEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!this.emailService.isResendApiConfigured) {
                res.status(503).json({
                    success: false,
                    message: "Resend API key is not configured",
                });
                return;
            }

            const { id } = req.params;
            const data = await this.emailService.getReceivedEmail(id);

            res.status(200).json({
                success: true,
                data,
                message: "Received email fetched successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    sendEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!this.emailService.isResendApiConfigured) {
                res.status(503).json({
                    success: false,
                    message: "Resend API key is not configured",
                });
                return;
            }
            if (!this.emailService.isEnabled) {
                res.status(503).json({
                    success: false,
                    message: "Email sending is disabled (set EMAIL_ENABLED=true)",
                });
                return;
            }

            const body = req.body as SendEmailRequestBody;
            await this.emailService.sendPlain({
                to: body.to,
                subject: body.subject,
                text: body.text,
                html: body.html,
                replyTo: body.reply_to,
                headers: body.in_reply_to
                    ? { "In-Reply-To": body.in_reply_to, References: body.in_reply_to }
                    : undefined,
            });

            res.status(200).json({
                success: true,
                data: { id: "sent" },
                message: "Email sent successfully",
            });
        } catch (error) {
            next(error);
        }
    };
}
