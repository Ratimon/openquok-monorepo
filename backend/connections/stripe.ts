import Stripe from "stripe";
import { config } from "../config/GlobalConfig";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
    const stripeCfg = config.stripe as { secretKey?: string } | undefined;
    const secretKey = stripeCfg?.secretKey?.trim();
    if (!secretKey) {
        throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
    }
    if (!stripeClient) {
        stripeClient = new Stripe(secretKey, {
            apiVersion: "2026-04-22.dahlia",
            appInfo: { name: "Openquok", version: "1.0.0" },
        });
    }
    return stripeClient;
}

export function isStripeConfigured(): boolean {
    const stripeCfg = config.stripe as { secretKey?: string; webhookSecret?: string } | undefined;
    return Boolean(stripeCfg?.secretKey?.trim() && stripeCfg?.webhookSecret?.trim());
}
