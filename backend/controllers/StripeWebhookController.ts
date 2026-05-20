import type { NextFunction, Request, Response } from "express";
import type { StripeService } from "../services/StripeService";
import type { RequestWithStripeRawBody } from "../middlewares/stripeWebhookRawBody";
import { logger } from "../utils/Logger";

export class StripeWebhookController {
    constructor(private readonly stripeService: StripeService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const signature = req.headers["stripe-signature"];
            if (typeof signature !== "string" || !signature) {
                res.status(400).json({ success: false, message: "Missing stripe-signature header" });
                return;
            }

            const rawBody = (req as RequestWithStripeRawBody).rawBody;
            if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) {
                res.status(400).json({
                    success: false,
                    message:
                        "Stripe webhook body was not captured as raw bytes. Use POST directly on the API (e.g. stripe listen --forward-to localhost:3000/api/v1/billing/webhooks/stripe).",
                });
                return;
            }

            const event = this.stripeService.validateWebhook(rawBody, signature);
            await this.stripeService.handleWebhookEvent(event);
            res.status(200).json({ received: true });
        } catch (error) {
            logger.error({
                msg: "[Stripe] Webhook processing failed",
                error: error instanceof Error ? error.message : String(error),
            });
            next(error);
        }
    };
}
