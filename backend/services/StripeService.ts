import type Stripe from "stripe";
import {
    isPaidSubscriptionTier,
    pricing,
    type PaidSubscriptionTier,
    type SubscriptionPeriod,
} from "openquok-common";
import { getStripeClient } from "../connections/stripe";
import { config } from "../config/GlobalConfig";
import {
    configuredStripePriceId,
    type StripePriceIdMap,
} from "../config/stripePriceConfig";
import { UserValidationError } from "../errors/UserError";
import { makeId } from "../utils/ids/makeId";
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";
import type { SubscriptionService } from "./SubscriptionService";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";

const STRIPE_SERVICE_METADATA = "openquok";

export interface BillingSubscribeBody {
    period: SubscriptionPeriod;
    billing: PaidSubscriptionTier;
    stripePriceId: string;
}

export class StripeService {
    constructor(
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly subscriptionService: SubscriptionService,
        private readonly organizationRepository: OrganizationRepository
    ) {}

    private frontendUrl(): string {
        return String((config.server as { frontendDomainUrl?: string }).frontendDomainUrl ?? "").replace(
            /\/+$/,
            ""
        );
    }

    validateWebhook(rawBody: Buffer | string, signature: string): Stripe.Event {
        const stripeCfg = config.stripe as { webhookSecret?: string } | undefined;
        const secret = stripeCfg?.webhookSecret?.trim();
        if (!secret) {
            throw new Error("Stripe webhook secret is not configured (STRIPE_WEBHOOK_SECRET).");
        }
        try {
            return getStripeClient().webhooks.constructEvent(rawBody, signature, secret);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes("No signatures found matching")) {
                throw new Error(
                    `${message} Check STRIPE_WEBHOOK_SECRET: with \`stripe listen\`, use the whsec_… secret printed by the CLI for this session, not the Dashboard webhook signing secret. Forward to the API port (localhost:3000), not the Vite dev server.`
                );
            }
            throw error;
        }
    }

    async createOrGetCustomer(organizationId: string): Promise<string> {
        const org = await this.subscriptionRepository.getOrganizationBilling(organizationId);
        if (!org) {
            throw new Error("Organization not found");
        }
        if (org.stripe_customer_id) {
            return org.stripe_customer_id;
        }

        const { members } = await this.organizationRepository.getTeam(organizationId);
        const lead = members.find((m) => m.role === "owner") ?? members[0];
        const rawEmail = lead?.email?.trim();
        const email =
            rawEmail && rawEmail.includes("@")
                ? rawEmail
                : rawEmail
                  ? `${rawEmail}@billing.local`
                  : "billing@openquok.local";

        const customer = await getStripeClient().customers.create({
            email,
            name: org.name,
            metadata: { organizationId, service: STRIPE_SERVICE_METADATA },
        });
        await this.subscriptionRepository.updateStripeCustomerId(organizationId, customer.id);
        return customer.id;
    }

    private stripePriceIds(): StripePriceIdMap {
        return (config.stripe as { priceIds?: StripePriceIdMap }).priceIds ?? ({} as StripePriceIdMap);
    }

    /** Prefer price id from the web app; optional backend env fallback; then auto-create. */
    private async resolvePriceId(
        tier: PaidSubscriptionTier,
        period: SubscriptionPeriod,
        stripePriceIdFromClient?: string
    ): Promise<string> {
        const fromClient = stripePriceIdFromClient?.trim();
        if (fromClient) {
            await this.assertPriceMatchesPlan(fromClient, tier, period);
            return fromClient;
        }
        const configured = configuredStripePriceId(this.stripePriceIds(), tier, period);
        if (configured) {
            return configured;
        }
        return this.findOrCreatePrice(tier, period);
    }

    /** Ensure the Stripe Price amount and interval match openquok-common pricing (anti-tamper). */
    private async assertPriceMatchesPlan(
        priceId: string,
        tier: PaidSubscriptionTier,
        period: SubscriptionPeriod
    ): Promise<void> {
        const stripe = getStripeClient();
        const price = await stripe.prices.retrieve(priceId);
        const limits = pricing[tier];
        const expectedCents =
            (period === "MONTHLY" ? limits.month_price : limits.year_price) * 100;
        const expectedInterval = period === "MONTHLY" ? "month" : "year";

        if (!price.active) {
            throw new UserValidationError("This Stripe price is not active.");
        }
        if (price.unit_amount !== expectedCents) {
            throw new UserValidationError(
                "Stripe price amount does not match the selected plan. Check VITE_PUBLIC_STRIPE_PRICE_ID_* in the web env."
            );
        }
        if (price.recurring?.interval !== expectedInterval) {
            throw new UserValidationError(
                "Stripe price billing interval does not match the selected cadence."
            );
        }
    }

    private async findOrCreatePrice(
        tier: PaidSubscriptionTier,
        period: SubscriptionPeriod
    ): Promise<string> {
        const stripe = getStripeClient();
        const limits = pricing[tier];
        const amountUsd =
            period === "MONTHLY" ? limits.month_price : limits.year_price;
        const interval = period === "MONTHLY" ? "month" : "year";
        const nickname = `${tier} ${period}`;

        const products = await stripe.products.list({ active: true, limit: 100 });
        let product =
            products.data.find((p) => p.name?.toUpperCase() === tier) ??
            (await stripe.products.create({ name: tier, active: true }));

        const prices = await stripe.prices.list({ active: true, product: product.id, limit: 100 });
        const existing = prices.data.find(
            (p) =>
                p.recurring?.interval === interval &&
                p.nickname === nickname &&
                p.unit_amount === amountUsd * 100
        );
        if (existing?.id) return existing.id;

        const created = await stripe.prices.create({
            active: true,
            product: product.id,
            currency: "usd",
            nickname,
            unit_amount: amountUsd * 100,
            recurring: { interval },
        });
        return created.id;
    }

    async subscribe(params: {
        organizationId: string;
        userId: string;
        body: BillingSubscribeBody;
        allowTrial: boolean;
    }): Promise<{ url?: string; clientSecret?: string; updated?: boolean }> {
        const customer = await this.createOrGetCustomer(params.organizationId);
        const uniqueId = makeId(12);
        const priceId = await this.resolvePriceId(
            params.body.billing,
            params.body.period,
            params.body.stripePriceId
        );
        const stripe = getStripeClient();
        const frontend = this.frontendUrl();

        const existing = await this.subscriptionRepository.getSubscriptionByOrganizationId(
            params.organizationId
        );

        const activeSubs = await stripe.subscriptions.list({
            customer,
            status: "all",
            limit: 20,
        });
        const current = activeSubs.data.find(
            (s) => s.status === "active" || s.status === "trialing"
        );

        if (current && existing) {
            const updated = await stripe.subscriptions.update(current.id, {
                items: [{ id: current.items.data[0]?.id, price: priceId }],
                proration_behavior: "create_prorations",
                metadata: {
                    service: STRIPE_SERVICE_METADATA,
                    billing: params.body.billing,
                    period: params.body.period,
                    uniqueId,
                    userId: params.userId,
                    organizationId: params.organizationId,
                },
            });
            await this.syncSubscriptionFromStripe(updated);
            return { updated: true };
        }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${frontend}/account/billing?checkout=${uniqueId}`,
            cancel_url: `${frontend}/account/billing`,
            subscription_data: {
                ...(params.allowTrial ? { trial_period_days: 7 } : {}),
                metadata: {
                    service: STRIPE_SERVICE_METADATA,
                    billing: params.body.billing,
                    period: params.body.period,
                    uniqueId,
                    userId: params.userId,
                    organizationId: params.organizationId,
                },
            },
            metadata: {
                service: STRIPE_SERVICE_METADATA,
                uniqueId,
                organizationId: params.organizationId,
            },
        });

        return { url: session.url ?? undefined };
    }

    async createBillingPortalSession(organizationId: string): Promise<string> {
        const customer = await this.createOrGetCustomer(organizationId);
        const session = await getStripeClient().billingPortal.sessions.create({
            customer,
            return_url: `${this.frontendUrl()}/account/billing`,
        });
        return session.url;
    }

    private tierFromMetadata(metadata: Stripe.Metadata | null | undefined): PaidSubscriptionTier | null {
        const billing = metadata?.billing;
        if (typeof billing === "string" && isPaidSubscriptionTier(billing)) {
            return billing;
        }
        return null;
    }

    private periodFromMetadata(metadata: Stripe.Metadata | null | undefined): SubscriptionPeriod {
        return metadata?.period === "YEARLY" ? "YEARLY" : "MONTHLY";
    }

    async syncSubscriptionFromStripe(subscription: Stripe.Subscription): Promise<void> {
        const metadata = subscription.metadata;
        if (metadata?.service !== STRIPE_SERVICE_METADATA) return;

        const tier = this.tierFromMetadata(metadata);
        if (!tier) return;

        const organizationId =
            typeof metadata.organizationId === "string"
                ? metadata.organizationId
                : (await this.subscriptionRepository.getOrganizationByStripeCustomerId(
                      String(subscription.customer)
                  ))?.id;

        if (!organizationId) return;

        const uniqueId =
            typeof metadata.uniqueId === "string" ? metadata.uniqueId : subscription.id;
        const period = this.periodFromMetadata(metadata);
        const isTrialing = subscription.status === "trialing";
        const cancelAt = subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000).toISOString()
            : null;

        await this.subscriptionService.createOrUpdateFromStripe({
            organizationId,
            isTrialing,
            identifier: uniqueId,
            subscriptionTier: tier,
            period,
            totalChannels: pricing[tier].channel_per_workspace,
            cancelAt,
        });
    }

    async handleWebhookEvent(event: Stripe.Event): Promise<void> {
        const objectMeta =
            event.data.object && typeof event.data.object === "object"
                ? (event.data.object as { metadata?: Stripe.Metadata }).metadata
                : undefined;

        if (
            objectMeta?.service !== STRIPE_SERVICE_METADATA &&
            event.type !== "invoice.payment_succeeded"
        ) {
            return;
        }

        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription;
                await this.syncSubscriptionFromStripe(sub);
                break;
            }
            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                const customerId =
                    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
                if (customerId) {
                    await this.subscriptionService.deleteSubscriptionForCustomer(customerId);
                }
                break;
            }
            default:
                break;
        }
    }
}
