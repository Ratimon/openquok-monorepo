import type { Express } from "express";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";
import type Stripe from "stripe";
import { PAID_SUBSCRIPTION_TIERS, pricing, type PaidSubscriptionTier, type SubscriptionPeriod } from "openquok-common";

import { app } from "../../../app";
import { config } from "../../../config/GlobalConfig";
import {
    configuredStripePriceId,
    type StripePriceIdMap,
} from "../../../config/stripePriceConfig";
import { getStripeClient } from "../../../connections/stripe";
import { subscriptionRepository } from "../../../repositories/index";
import { stripeService } from "../../../services/index";
import { ACTIVE_ORGANIZATION_COOKIE } from "../../../utils/session/sessionCookies";
import type { UserTestHelper } from "../../helpers/userTestHelper";
import { activateWorkspace } from "../../helpers/workspaceTestHelper";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const usersPath = `${apiPrefix}/users`;
export const billingPath = `${apiPrefix}/billing`;

const STRIPE_SERVICE_METADATA = "openquok";
const TEST_PAYMENT_METHOD = "pm_card_visa";

export type BillingSession = {
    accessToken: string;
    organizationId: string;
    cookieHeader: string;
};

export type StripeBillingFixture = {
    testClockId: string;
    customerId: string;
    subscriptionId: string;
};

/** Stripe invoice preview + catalog prices used in proration assertion messages. */
export type ProrationBreakdown = {
    fromTier: PaidSubscriptionTier;
    toTier: PaidSubscriptionTier;
    period: SubscriptionPeriod;
    fromMonthlyCatalogUsd: number;
    toMonthlyCatalogUsd: number;
    fromStripeMonthlyUsd: number;
    toStripeMonthlyUsd: number;
    periodStartUnix: number;
    periodEndUnix: number;
    prorationDateUnix: number;
    daysRemaining: number;
    daysInPeriod: number;
    amountDueCents: number;
    /** Matches POST /billing/prorate: max(0, amount_due) / 100 */
    payTodayUsd: number;
    /** Raw Stripe amount_due / 100 (may be negative on downgrade). */
    rawPayTodayUsd: number;
    /** Mid-cycle linear estimate for documentation only. */
    linearEstimateUsd: number;
    lineItems: Array<{ description: string; amountUsd: number }>;
    formulaSummary: string;
    formulaDetail: string;
};

export type ProrateAfterClockResult = {
    payTodayUsd: number;
    elapsedDays: number;
    breakdown: ProrationBreakdown;
};

export function hasSupabaseForBillingE2e(): boolean {
    const supabase = config.supabase as { supabaseUrl?: string; supabaseSecretKey?: string };
    return Boolean(supabase.supabaseUrl?.trim() && supabase.supabaseSecretKey?.trim());
}

export function hasStripeBillingE2eConfig(): boolean {
    const stripe = config.stripe as { secretKey?: string; publishableKey?: string; priceIds?: StripePriceIdMap };
    if (!stripe.secretKey?.trim() || !stripe.publishableKey?.trim()) return false;
    const priceIds = stripe.priceIds ?? ({} as StripePriceIdMap);
    return PAID_SUBSCRIPTION_TIERS.every((tier) =>
        Boolean(configuredStripePriceId(priceIds, tier, "MONTHLY"))
    );
}

/** Opt-in real Stripe test-mode calls (test clocks, proration previews). */
export function stripeBillingE2eEnabled(): boolean {
    return (
        (process.env.THIRD_PARTY_TESTS_STRIPE ?? "").toLowerCase() === "true" &&
        hasSupabaseForBillingE2e() &&
        hasStripeBillingE2eConfig()
    );
}

export function stripePriceIdForTier(
    tier: PaidSubscriptionTier,
    period: SubscriptionPeriod
): string {
    const priceIds = (config.stripe as { priceIds: StripePriceIdMap }).priceIds;
    const id = configuredStripePriceId(priceIds, tier, period);
    if (!id) {
        throw new Error(
            `Missing Stripe price id for ${tier} ${period}. Set STRIPE_PRICE_ID_${tier}_${period} in backend env.`
        );
    }
    return id;
}

export async function getDefaultOrganizationId(accessToken: string): Promise<string> {
    const res = await supertest(app)
        .get(`${usersPath}/organizations`)
        .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const orgId = res.body?.data?.[0]?.id as string | undefined;
    expect(orgId).toBeDefined();
    return orgId!;
}

export async function prepareBillingSession(
    accessToken: string,
    userHelper: UserTestHelper
): Promise<BillingSession> {
    const organizationId = await getDefaultOrganizationId(accessToken);
    userHelper.trackOrganization(organizationId);
    await activateWorkspace(accessToken, organizationId);
    return {
        accessToken,
        organizationId,
        cookieHeader: `${ACTIVE_ORGANIZATION_COOKIE}=${organizationId}`,
    };
}

function withBillingAuth<T extends supertest.Test>(request: T, session: BillingSession): T {
    return request
        .set("Authorization", `Bearer ${session.accessToken}`)
        .set("Cookie", [session.cookieHeader]) as T;
}

export function billingGet(expressApp: Express, session: BillingSession, path: string): supertest.Test {
    return withBillingAuth(supertest(expressApp).get(path), session);
}

export function billingPost(expressApp: Express, session: BillingSession, path: string): supertest.Test {
    return withBillingAuth(supertest(expressApp).post(path), session);
}

export async function postBillingProrate(
    session: BillingSession,
    body: { billing: PaidSubscriptionTier; period: SubscriptionPeriod }
): Promise<{ status: number; price: number }> {
    const res = await billingPost(app, session, `${billingPath}/prorate`).send({
        ...body,
        organizationId: session.organizationId,
    });
    return { status: res.status, price: res.body?.data?.price ?? 0 };
}

async function stripeMonthlyUsd(priceId: string): Promise<number> {
    const stripe = getStripeClient();
    const price = await stripe.prices.retrieve(priceId);
    return (price.unit_amount ?? 0) / 100;
}

/**
 * Loads Stripe invoice preview line items and period math for Pay Today assertions.
 * Formula (UI): Pay Today = max(0, invoice_preview.amount_due / 100).
 */
export async function buildProrationBreakdown(params: {
    fixture: StripeBillingFixture;
    fromTier: PaidSubscriptionTier;
    toTier: PaidSubscriptionTier;
    period: SubscriptionPeriod;
}): Promise<ProrationBreakdown> {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(params.fixture.subscriptionId);
    const itemId = subscription.items.data[0]?.id;
    if (!itemId) {
        throw new Error("Stripe subscription has no line item for proration breakdown");
    }

    const fromPriceId = stripePriceIdForTier(params.fromTier, params.period);
    const toPriceId = stripePriceIdForTier(params.toTier, params.period);
    const fromStripeMonthlyUsd = await stripeMonthlyUsd(fromPriceId);
    const toStripeMonthlyUsd = await stripeMonthlyUsd(toPriceId);

    const subscriptionFields = subscription as unknown as {
        current_period_start?: number;
        current_period_end?: number;
        created?: number;
    };
    const prorationDateUnix = Math.floor(Date.now() / 1000);
    let periodStartUnix = subscriptionFields.current_period_start ?? 0;
    let periodEndUnix = subscriptionFields.current_period_end ?? 0;
    if (periodStartUnix > 0 && periodEndUnix <= periodStartUnix) {
        periodEndUnix = periodStartUnix + 30 * 86_400;
    }
    if (!periodStartUnix) {
        periodStartUnix = subscriptionFields.created ?? prorationDateUnix - 10 * 86_400;
        periodEndUnix = periodStartUnix + 30 * 86_400;
    }
    const daysInPeriod = Math.max((periodEndUnix - periodStartUnix) / 86_400, 1);
    const daysRemaining = Math.max((periodEndUnix - prorationDateUnix) / 86_400, 0);

    const preview = await stripe.invoices.createPreview({
        customer: params.fixture.customerId,
        subscription: subscription.id,
        subscription_details: {
            proration_behavior: "create_prorations",
            items: [{ id: itemId, price: toPriceId, quantity: 1 }],
            proration_date: prorationDateUnix,
        },
    });

    const amountDueCents = preview.amount_due ?? preview.amount_remaining ?? 0;
    const rawPayTodayUsd = amountDueCents / 100;
    const payTodayUsd = rawPayTodayUsd > 0 ? rawPayTodayUsd : 0;
    const linearEstimateUsd =
        (toStripeMonthlyUsd - fromStripeMonthlyUsd) * (daysRemaining / daysInPeriod);

    const lineItems = (preview.lines?.data ?? []).map((line) => ({
        description: line.description ?? "Line item",
        amountUsd: (line.amount ?? 0) / 100,
    }));

    const fromCatalog = pricing[params.fromTier].month_price;
    const toCatalog = pricing[params.toTier].month_price;
    const formulaSummary =
        "Pay Today = max(0, Stripe invoice preview amount_due ÷ 100)";
    const formulaDetail = [
        "Stripe preview = unused-time credit on current plan",
        "+ prorated charge for new plan through period end (proration_date = now).",
        `Linear estimate ≈ (new_monthly − old_monthly) × (days_remaining ÷ days_in_period)`,
        `= ($${toStripeMonthlyUsd} − $${fromStripeMonthlyUsd}) × (${daysRemaining.toFixed(2)} ÷ ${daysInPeriod.toFixed(2)})`,
        `≈ $${linearEstimateUsd.toFixed(2)}`,
    ].join(" ");

    return {
        fromTier: params.fromTier,
        toTier: params.toTier,
        period: params.period,
        fromMonthlyCatalogUsd: fromCatalog,
        toMonthlyCatalogUsd: toCatalog,
        fromStripeMonthlyUsd,
        toStripeMonthlyUsd,
        periodStartUnix,
        periodEndUnix,
        prorationDateUnix,
        daysRemaining,
        daysInPeriod,
        amountDueCents,
        payTodayUsd,
        rawPayTodayUsd,
        linearEstimateUsd,
        lineItems,
        formulaSummary,
        formulaDetail,
    };
}

/** Multi-line report shown when a proration assertion fails. */
export function formatProrationAssertionReport(
    label: string,
    breakdown: ProrationBreakdown,
    apiPayTodayUsd: number
): string {
    const lines = [
        label,
        breakdown.formulaSummary,
        breakdown.formulaDetail,
        `Plan change: ${breakdown.fromTier} ($${breakdown.fromMonthlyCatalogUsd}/mo catalog, $${breakdown.fromStripeMonthlyUsd} Stripe) → ${breakdown.toTier} ($${breakdown.toMonthlyCatalogUsd}/mo catalog, $${breakdown.toStripeMonthlyUsd} Stripe)`,
        `Billing period: ${breakdown.daysRemaining.toFixed(2)} days remaining of ${breakdown.daysInPeriod.toFixed(2)} days`,
        `Stripe preview amount_due: $${breakdown.rawPayTodayUsd.toFixed(2)} → Pay Today (UI/API): $${breakdown.payTodayUsd.toFixed(2)}`,
        `POST /billing/prorate returned: $${apiPayTodayUsd.toFixed(2)}`,
    ];
    if (breakdown.lineItems.length) {
        lines.push("Stripe preview line items:");
        for (const item of breakdown.lineItems) {
            lines.push(`  • ${item.description}: $${item.amountUsd.toFixed(2)}`);
        }
    }
    return lines.join("\n");
}

/**
 * Asserts API prorate matches Stripe preview and includes dollar amounts in failure output.
 */
function assertWithProrationReport(
    report: string,
    ok: boolean,
    message: string
): void {
    if (!ok) {
        throw new Error(`${report}\n\n${message}`);
    }
}

export function assertPayTodayProrate(params: {
    label: string;
    breakdown: ProrationBreakdown;
    apiPayTodayUsd: number;
    greaterThan?: number;
    lessThan?: number;
}): void {
    const report = formatProrationAssertionReport(
        params.label,
        params.breakdown,
        params.apiPayTodayUsd
    );
    assertWithProrationReport(
        report,
        Math.abs(params.apiPayTodayUsd - params.breakdown.payTodayUsd) < 0.01,
        `Expected Pay Today $${params.breakdown.payTodayUsd.toFixed(2)} from Stripe preview, API returned $${params.apiPayTodayUsd.toFixed(2)}`
    );
    if (params.greaterThan != null) {
        assertWithProrationReport(
            report,
            params.apiPayTodayUsd > params.greaterThan,
            `Expected Pay Today > $${params.greaterThan.toFixed(2)}, got $${params.apiPayTodayUsd.toFixed(2)}`
        );
    }
    if (params.lessThan != null) {
        assertWithProrationReport(
            report,
            params.apiPayTodayUsd < params.lessThan,
            `Expected Pay Today < $${params.lessThan.toFixed(2)}, got $${params.apiPayTodayUsd.toFixed(2)}`
        );
    }
}

/**
 * Advances the test clock in steps until POST /billing/prorate reports a positive amount,
 * or throws when the cap is reached (Stripe invoice preview can lag behind clock advances).
 */
export async function postBillingProrateAfterAdvancingClock(params: {
    session: BillingSession;
    fixture: StripeBillingFixture;
    fromTier: PaidSubscriptionTier;
    target: { billing: PaidSubscriptionTier; period: SubscriptionPeriod };
    startDays: number;
    stepDays?: number;
    maxDays?: number;
}): Promise<ProrateAfterClockResult> {
    const stripe = getStripeClient();
    const step = params.stepDays ?? 5;
    const max = params.maxDays ?? 35;
    let elapsedDays = 0;
    let lastPrice = 0;

    while (elapsedDays <= max) {
        const delta = elapsedDays === 0 ? params.startDays : step;
        if (delta > 0) {
            await advanceTestClockByDays(stripe, params.fixture.testClockId, delta);
            elapsedDays += delta;
        }
        const { status, price } = await postBillingProrate(params.session, params.target);
        expect(status).toBe(200);
        lastPrice = price;
        if (price > 0) {
            const breakdown = await buildProrationBreakdown({
                fixture: params.fixture,
                fromTier: params.fromTier,
                toTier: params.target.billing,
                period: params.target.period,
            });
            return { payTodayUsd: price, elapsedDays, breakdown };
        }
        if (elapsedDays >= max) break;
    }

    throw new Error(
        `Expected positive proration for ${params.target.billing} after advancing test clock ${elapsedDays}d (last price $${lastPrice.toFixed(2)})`
    );
}

export async function waitForTestClockReady(stripe: Stripe, clockId: string, maxMs = 60_000): Promise<void> {
    const started = Date.now();
    while (Date.now() - started < maxMs) {
        const clock = await stripe.testHelpers.testClocks.retrieve(clockId);
        if (clock.status === "ready") return;
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error(`Stripe test clock ${clockId} did not become ready within ${maxMs}ms`);
}

export async function advanceTestClockByDays(
    stripe: Stripe,
    clockId: string,
    days: number
): Promise<void> {
    const clock = await stripe.testHelpers.testClocks.retrieve(clockId);
    const target = clock.frozen_time + days * 24 * 60 * 60;
    await stripe.testHelpers.testClocks.advance(clockId, { frozen_time: target });
    await waitForTestClockReady(stripe, clockId);
}

/**
 * Seeds a billable Stripe subscription for the workspace and syncs the local DB row.
 * Uses a test clock so billing periods can be advanced for proration previews.
 */
export async function seedStripeSubscriptionFixture(params: {
    organizationId: string;
    tier: PaidSubscriptionTier;
    period: SubscriptionPeriod;
    trialDays?: number;
}): Promise<StripeBillingFixture> {
    const stripe = getStripeClient();
    const frozenTime = Math.floor(Date.now() / 1000);
    const clock = await stripe.testHelpers.testClocks.create({ frozen_time: frozenTime });
    const customer = await stripe.customers.create({
        email: `billing-e2e-${uuidv4()}@test.com`,
        test_clock: clock.id,
        metadata: { organizationId: params.organizationId, service: STRIPE_SERVICE_METADATA },
    });

    const attachedPaymentMethod = await stripe.paymentMethods.attach(TEST_PAYMENT_METHOD, {
        customer: customer.id,
    });
    await stripe.customers.update(customer.id, {
        invoice_settings: { default_payment_method: attachedPaymentMethod.id },
    });

    await subscriptionRepository.updateStripeCustomerId(params.organizationId, customer.id);

    const priceId = stripePriceIdForTier(params.tier, params.period);
    const uniqueId = `e2e-${uuidv4().slice(0, 8)}`;
    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId, quantity: 1 }],
        ...(params.trialDays && params.trialDays > 0 ? { trial_period_days: params.trialDays } : {}),
        metadata: {
            service: STRIPE_SERVICE_METADATA,
            billing: params.tier,
            period: params.period,
            uniqueId,
            organizationId: params.organizationId,
        },
    });

    await stripeService.syncSubscriptionFromStripe(subscription);
    if (subscription.status === "trialing") {
        await subscriptionRepository.setTrialing(params.organizationId, true);
    }

    return {
        testClockId: clock.id,
        customerId: customer.id,
        subscriptionId: subscription.id,
    };
}

export async function deleteStripeBillingFixture(fixture: StripeBillingFixture | undefined): Promise<void> {
    if (!fixture?.testClockId) return;
    const stripe = getStripeClient();
    try {
        await stripe.testHelpers.testClocks.del(fixture.testClockId);
    } catch {
        // Stripe removes customers/subscriptions with the clock; ignore cleanup races.
    }
}
