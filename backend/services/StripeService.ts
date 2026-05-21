import type Stripe from "stripe";
import groupBy from "lodash/groupBy";
import {
    isPaidSubscriptionTier,
    PAID_SUBSCRIPTION_TIERS,
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

/** Live or catalog price row grouped by Stripe recurring interval (`month` / `year`). */
export interface SubscriptionTierPriceRow {
    name: string;
    recurring: string;
    price: number;
}

export type SubscriptionTiersPackages = Record<string, SubscriptionTierPriceRow[]>;

const STRIPE_PRICE_LOOKUP_KEYS = PAID_SUBSCRIPTION_TIERS.flatMap((tier) => [
    `${tier.toLowerCase()}_monthly`,
    `${tier.toLowerCase()}_yearly`,
]);

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

    private billingEnabled(): boolean {
        const stripeCfg = config.stripe as { publishableKey?: string } | undefined;
        return Boolean(stripeCfg?.publishableKey?.trim());
    }

    private packagesFromCatalog(): SubscriptionTiersPackages {
        const rows: SubscriptionTierPriceRow[] = PAID_SUBSCRIPTION_TIERS.flatMap((tier) => {
            const plan = pricing[tier];
            return [
                { name: tier, recurring: "month", price: plan.month_price },
                { name: tier, recurring: "year", price: plan.year_price },
            ];
        });
        return groupBy(rows, "recurring");
    }

    private stripePriceAmountUsd(price: Stripe.Price): number {
        const tiered = price.tiers?.[0]?.unit_amount;
        if (tiered != null) return tiered / 100;
        return (price.unit_amount ?? 0) / 100;
    }

    private mapStripePricesToPackages(prices: Stripe.Price[]): SubscriptionTiersPackages {
        const rows: SubscriptionTierPriceRow[] = [];
        for (const p of prices) {
            const interval = p.recurring?.interval;
            if (!interval) continue;
            const product = p.product;
            const name =
                typeof product === "object" && product && "name" in product
                    ? String(product.name ?? "")
                    : "";
            if (!name) continue;
            rows.push({
                name,
                recurring: interval,
                price: this.stripePriceAmountUsd(p),
            });
        }
        return groupBy(rows, "recurring");
    }

    private async fetchConfiguredStripePrices(): Promise<Stripe.Price[]> {
        const stripe = getStripeClient();
        const ids: string[] = [];
        const priceIds = this.stripePriceIds();
        for (const tier of PAID_SUBSCRIPTION_TIERS) {
            const monthly = configuredStripePriceId(priceIds, tier, "MONTHLY");
            const yearly = configuredStripePriceId(priceIds, tier, "YEARLY");
            if (monthly) ids.push(monthly);
            if (yearly) ids.push(yearly);
        }
        const uniqueIds = [...new Set(ids)];
        const prices = await Promise.all(
            uniqueIds.map((id) =>
                stripe.prices.retrieve(id, { expand: ["product"] })
            )
        );
        return prices.filter((p) => p.active);
    }

    /**
     * Active Stripe prices grouped by billing interval (`month` / `year`).
     * Uses Dashboard lookup keys when present, else configured price ids, else the plan catalog.
     */
    async getPackages(): Promise<SubscriptionTiersPackages> {
        if (!this.billingEnabled()) {
            return this.packagesFromCatalog();
        }

        try {
            const stripe = getStripeClient();
            const listed = await stripe.prices.list({
                active: true,
                expand: ["data.tiers", "data.product"],
                lookup_keys: [...STRIPE_PRICE_LOOKUP_KEYS],
                limit: 100,
            });
            if (listed.data.length > 0) {
                return this.mapStripePricesToPackages(listed.data);
            }

            const configured = await this.fetchConfiguredStripePrices();
            if (configured.length > 0) {
                return this.mapStripePricesToPackages(configured);
            }
        } catch {
            /* Stripe unavailable — fall back to catalog amounts */
        }

        return this.packagesFromCatalog();
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

    /**
     * Poll checkout completion after redirect.
     * 0 = pending, 1 = payment failed / canceled, 2 = subscription active in DB.
     */
    async checkCheckoutStatus(organizationId: string, checkoutId: string): Promise<0 | 1 | 2> {
        const row = await this.subscriptionRepository.checkSubscriptionByIdentifier(
            organizationId,
            checkoutId
        );
        if (row) return 2;

        const org = await this.subscriptionRepository.getOrganizationBilling(organizationId);
        const customerId = org?.stripe_customer_id;
        if (!customerId) return 0;

        const stripe = getStripeClient();
        const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 });
        if (subs.data.length === 0) return 0;

        const match = subs.data.find((s) => s.metadata?.uniqueId === checkoutId);
        if (match?.canceled_at) return 1;
        return 0;
    }

    async checkDiscountEligible(customerId: string | null | undefined): Promise<boolean> {
        const couponId = (config.stripe as { discountCouponId?: string }).discountCouponId?.trim();
        if (!couponId || !customerId) return false;

        const stripe = getStripeClient();
        const charges = await stripe.charges.list({ customer: customerId, limit: 1 });
        if (!charges.data.some((c) => c.amount > 1000)) return false;

        const subs = await stripe.subscriptions.list({
            customer: customerId,
            status: "all",
            expand: ["data.discounts"],
            limit: 10,
        });
        const active = subs.data.find((s) => s.status === "active" || s.status === "trialing");
        if (!active) return false;

        const interval = active.items.data[0]?.price?.recurring?.interval;
        if (interval === "year") return false;
        const discounts = active.discounts ?? [];
        if (discounts.length > 0) return false;

        return true;
    }

    async applyRetentionDiscount(customerId: string): Promise<boolean> {
        const couponId = (config.stripe as { discountCouponId?: string }).discountCouponId?.trim();
        if (!couponId) return false;
        const eligible = await this.checkDiscountEligible(customerId);
        if (!eligible) return false;

        const stripe = getStripeClient();
        const subs = await stripe.subscriptions.list({
            customer: customerId,
            status: "all",
            limit: 10,
        });
        const active = subs.data.find((s) => s.status === "active" || s.status === "trialing");
        if (!active) return false;

        await stripe.subscriptions.update(active.id, {
            discounts: [{ coupon: couponId }],
        });
        return true;
    }

    async finishTrial(customerId: string | null | undefined): Promise<void> {
        if (!customerId) return;
        const stripe = getStripeClient();
        const subs = (await stripe.subscriptions.list({ customer: customerId, limit: 20 })).data.filter(
            (s) => s.status === "trialing"
        );
        if (!subs[0]?.id) return;
        const updated = await stripe.subscriptions.update(subs[0].id, { trial_end: "now" });
        await this.syncSubscriptionFromStripe(updated);
        const org = await this.subscriptionRepository.getOrganizationByStripeCustomerId(customerId);
        if (org) await this.subscriptionRepository.setTrialing(org.id, false);
    }

    async previewProration(
        organizationId: string,
        body: Pick<BillingSubscribeBody, "billing" | "period">
    ): Promise<{ price: number }> {
        const customer = await this.createOrGetCustomer(organizationId);
        const priceId = await this.resolvePriceId(body.billing, body.period);
        const stripe = getStripeClient();
        const prorationDate = Math.floor(Date.now() / 1000);

        const subs = await stripe.subscriptions.list({ customer, status: "all", limit: 20 });
        const current = subs.data.find((s) => s.status === "active" || s.status === "trialing");
        if (!current?.items.data[0]?.id) return { price: 0 };

        try {
            const preview = await stripe.invoices.createPreview({
                customer,
                subscription: current.id,
                subscription_details: {
                    proration_behavior: "create_prorations",
                    billing_cycle_anchor: "now",
                    items: [
                        {
                            id: current.items.data[0].id,
                            price: priceId,
                            quantity: 1,
                        },
                    ],
                    proration_date: prorationDate,
                },
            });
            return {
                price: preview.amount_remaining ? preview.amount_remaining / 100 : 0,
            };
        } catch {
            return { price: 0 };
        }
    }

    async setSubscriptionCancelAtPeriodEnd(organizationId: string): Promise<{
        id: string;
        cancelAt?: Date;
    }> {
        const customer = await this.createOrGetCustomer(organizationId);
        const stripe = getStripeClient();
        const uniqueId = makeId(10);

        const subs = (
            await stripe.subscriptions.list({
                customer,
                status: "all",
                expand: ["data.latest_invoice"],
                limit: 20,
            })
        ).data.filter((s) => s.status !== "canceled");

        const sub = subs[0];
        if (!sub) {
            throw new UserValidationError("No active subscription found");
        }

        if (sub.cancel_at_period_end) {
            const updated = await stripe.subscriptions.update(sub.id, {
                cancel_at_period_end: false,
                metadata: { service: STRIPE_SERVICE_METADATA, uniqueId },
            });
            return {
                id: uniqueId,
                cancelAt: updated.cancel_at ? new Date(updated.cancel_at * 1000) : undefined,
            };
        }

        const latestInvoice = sub.latest_invoice as Stripe.Invoice | null;
        const hasFailedPayment =
            sub.status === "past_due" ||
            latestInvoice?.status === "open" ||
            latestInvoice?.status === "uncollectible";

        if (hasFailedPayment) {
            await stripe.subscriptions.cancel(sub.id);
            await this.subscriptionService.deleteSubscriptionForCustomer(customer);
            return { id: uniqueId, cancelAt: new Date() };
        }

        const updated = await stripe.subscriptions.update(sub.id, {
            cancel_at_period_end: true,
            metadata: { service: STRIPE_SERVICE_METADATA, uniqueId },
        });
        return {
            id: uniqueId,
            cancelAt: updated.cancel_at ? new Date(updated.cancel_at * 1000) : undefined,
        };
    }

    async createEmbeddedCheckout(params: {
        organizationId: string;
        userId: string;
        body: BillingSubscribeBody;
        allowTrial: boolean;
    }): Promise<{ clientSecret?: string }> {
        const customer = await this.createOrGetCustomer(params.organizationId);
        const uniqueId = makeId(12);
        const priceId = await this.resolvePriceId(
            params.body.billing,
            params.body.period,
            params.body.stripePriceId
        );
        const frontend = this.frontendUrl();
        const stripe = getStripeClient();

        const session = await stripe.checkout.sessions.create({
            ui_mode: "elements",
            mode: "subscription",
            customer,
            line_items: [{ price: priceId, quantity: 1 }],
            return_url: `${frontend}/account/billing?checkout=${uniqueId}`,
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

        return { clientSecret: session.client_secret ?? undefined };
    }

    async listCharges(organizationId: string): Promise<
        Array<{
            id: string;
            amount: number;
            currency: string;
            created: number;
            status: string;
            refunded: boolean;
            amount_refunded: number;
            description: string | null;
            receipt_url: string | null;
            invoice: string | null;
            invoice_pdf: string | null;
        }>
    > {
        const org = await this.subscriptionRepository.getOrganizationBilling(organizationId);
        if (!org?.stripe_customer_id) return [];

        const stripe = getStripeClient();
        const charges = await stripe.charges.list({ customer: org.stripe_customer_id, limit: 100 });
        const chargeList = charges.data
            .filter((c) => c.status === "succeeded")
            .map((charge) => {
                const invoiceRef = (charge as Stripe.Charge & {
                    invoice?: string | Stripe.Invoice | null;
                }).invoice;
                return {
                    id: charge.id,
                    amount: charge.amount,
                    currency: charge.currency,
                    created: charge.created,
                    status: charge.status,
                    refunded: charge.refunded,
                    amount_refunded: charge.amount_refunded,
                    description: charge.description,
                    receipt_url: charge.receipt_url ?? null,
                    invoice:
                        typeof invoiceRef === "string"
                            ? invoiceRef
                            : (invoiceRef as Stripe.Invoice | null)?.id ?? null,
                };
            });

        const invoiceIds = chargeList
            .map((c) => c.invoice)
            .filter((id): id is string => Boolean(id));
        const invoicePdfMap: Record<string, string> = {};
        for (const invoiceId of invoiceIds) {
            try {
                const inv = await stripe.invoices.retrieve(invoiceId);
                if (inv.invoice_pdf) invoicePdfMap[invoiceId] = inv.invoice_pdf;
            } catch {
                /* ignore */
            }
        }

        return chargeList.map((charge) => ({
            ...charge,
            invoice_pdf:
                charge.invoice && invoicePdfMap[charge.invoice]
                    ? invoicePdfMap[charge.invoice]
                    : null,
        }));
    }

    async refundCharges(
        organizationId: string,
        chargeIds: string[]
    ): Promise<{ refunded: string[]; failed: string[] }> {
        const org = await this.subscriptionRepository.getOrganizationBilling(organizationId);
        if (!org?.stripe_customer_id) {
            throw new UserValidationError("No payment customer found for this organization");
        }

        const stripe = getStripeClient();
        const refunded: string[] = [];
        const failed: string[] = [];
        for (const chargeId of chargeIds) {
            try {
                await stripe.refunds.create({ charge: chargeId });
                refunded.push(chargeId);
            } catch {
                failed.push(chargeId);
            }
        }
        return { refunded, failed };
    }

    async cancelSubscriptionImmediately(organizationId: string): Promise<{ cancelled: true }> {
        const org = await this.subscriptionRepository.getOrganizationBilling(organizationId);
        if (!org?.stripe_customer_id) {
            throw new UserValidationError("No payment customer found for this organization");
        }

        const stripe = getStripeClient();
        const subs = (
            await stripe.subscriptions.list({ customer: org.stripe_customer_id, status: "all", limit: 20 })
        ).data.filter((s) => s.status !== "canceled");

        if (!subs.length) {
            throw new UserValidationError("No active subscription found");
        }

        await stripe.subscriptions.cancel(subs[0].id);
        await this.subscriptionService.deleteSubscriptionForCustomer(org.stripe_customer_id);
        return { cancelled: true };
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
