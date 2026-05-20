import type { IncomingMessage } from "http";
import type { NextFunction, Request, Response } from "express";
import express from "express";

export type RequestWithStripeRawBody = Request & {
    rawBody?: Buffer;
    _skipJsonParsing?: boolean;
};

/** True when Stripe CLI or Dashboard delivers a signed webhook payload. */
function shouldParseStripeWebhookRaw(req: IncomingMessage): boolean {
    if (req.headers["stripe-signature"]) {
        return true;
    }
    const contentType = String(req.headers["content-type"] ?? "").toLowerCase();
    return contentType.includes("application/json");
}

/**
 * Express middleware chain for `POST …/billing/webhooks/stripe`.
 * Must run before any `express.json()` so `constructEvent` receives unmodified bytes.
 */
export function stripeWebhookRawBodyMiddleware(bodyLimit: string): express.RequestHandler[] {
    return [
        express.raw({
            type: shouldParseStripeWebhookRaw,
            limit: bodyLimit,
        }),
        (req: RequestWithStripeRawBody, res: Response, next: NextFunction) => {
            const body = req.body;
            if (!Buffer.isBuffer(body) || body.length === 0) {
                res.status(400).json({
                    success: false,
                    message:
                        "Stripe webhook requires a raw JSON body. Forward to the API port directly (e.g. localhost:3000), not through a proxy that re-encodes JSON.",
                });
                return;
            }
            req.rawBody = body;
            req._skipJsonParsing = true;
            next();
        },
    ];
}
