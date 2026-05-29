/// <reference types="jest" />
import Stripe from "stripe";
import { faker } from "@faker-js/faker";
import { pricing } from "openquok-common";

import { UserValidationError } from "../errors/UserError";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";
import type { UserRepository } from "../repositories/UserRepository";
import type { SubscriptionService } from "./SubscriptionService";
import { StripeService } from "./StripeService";

const organizationId = faker.string.uuid();
const userId = faker.string.uuid();
const customerId = "cus_test_123";
const checkoutId = "checkout-unique-12";
const priceId = "price_solo_monthly";

const mockConstructEvent = jest.fn();
const mockStripe = {
    webhooks: { constructEvent: mockConstructEvent },
    customers: { create: jest.fn(), retrieve: jest.fn(), update: jest.fn() },
    prices: { retrieve: jest.fn(), list: jest.fn(), create: jest.fn() },
    products: { list: jest.fn(), create: jest.fn() },
    subscriptions: {
        list: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
    },
    checkout: { sessions: { create: jest.fn(), list: jest.fn() } },
    billingPortal: { sessions: { create: jest.fn() } },
    charges: { list: jest.fn() },
    invoices: { retrieve: jest.fn(), createPreview: jest.fn() },
    refunds: { create: jest.fn() },
};

jest.mock("../connections/stripe", () => ({
    getStripeClient: () => mockStripe,
}));

jest.mock("../config/GlobalConfig", () => ({
    config: {
        server: { frontendDomainUrl: "https://app.example.com/" },
        stripe: {
            publishableKey: "pk_test",
            webhookSecret: "whsec_test",
            priceIds: {
                SOLO: { monthly: "price_solo_monthly", yearly: "price_solo_yearly" },
                TEAM: { monthly: "", yearly: "" },
                ULTIMATE: { monthly: "", yearly: "" },
                MAX: { monthly: "", yearly: "" },
            },
            discountCouponId: "coupon_retention",
        },
    },
}));

jest.mock("../utils/ids/makeId", () => ({
    makeId: jest.fn(() => checkoutId),
}));

function defaultOrganizationBilling() {
    return {
        id: organizationId,
        name: "Test Org",
        stripe_customer_id: customerId,
        allow_trial: true,
        is_trialing: false,
    };
}

function createMockSubscriptionRepo(): jest.Mocked<SubscriptionRepository> {
    return {
        getOrganizationBilling: jest.fn().mockResolvedValue(defaultOrganizationBilling()),
        updateStripeCustomerId: jest.fn(),
        clearStripeCustomerId: jest.fn(),
        getSubscriptionByOrganizationId: jest.fn(),
        checkSubscriptionByIdentifier: jest.fn(),
        getSubscriptionByIdentifier: jest.fn(),
        getOrganizationByStripeCustomerId: jest.fn(),
        setTrialing: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;
}

function createMockSubscriptionService(): jest.Mocked<
    Pick<
        SubscriptionService,
        "createOrUpdateFromStripe" | "deleteSubscriptionForCustomer" | "getEffectiveSubscription"
    >
> {
    return {
        createOrUpdateFromStripe: jest.fn().mockResolvedValue(undefined),
        deleteSubscriptionForCustomer: jest.fn().mockResolvedValue(undefined),
        getEffectiveSubscription: jest.fn().mockResolvedValue(null),
    };
}

function createMockOrganizationRepo(): jest.Mocked<OrganizationRepository> {
    return {
        getTeam: jest.fn(),
    } as unknown as jest.Mocked<OrganizationRepository>;
}

function createMockUserRepo(): jest.Mocked<Pick<UserRepository, "findFullUserByUserId">> {
    return {
        findFullUserByUserId: jest.fn(),
    };
}

function stripeSubscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
    return {
        id: "sub_test",
        object: "subscription",
        customer: customerId,
        status: "active",
        metadata: {
            service: "openquok",
            billing: "SOLO",
            period: "MONTHLY",
            uniqueId: checkoutId,
            organizationId,
        },
        items: {
            object: "list",
            data: [
                {
                    id: "si_test",
                    price: { id: priceId, recurring: { interval: "month" } },
                } as Stripe.SubscriptionItem,
            ],
        } as Stripe.ApiList<Stripe.SubscriptionItem>,
        cancel_at: null,
        canceled_at: null,
        ...overrides,
    } as Stripe.Subscription;
}

describe("StripeService", () => {
    let subscriptionRepo: jest.Mocked<SubscriptionRepository>;
    let subscriptionService: ReturnType<typeof createMockSubscriptionService>;
    let organizationRepo: jest.Mocked<OrganizationRepository>;
    let userRepo: jest.Mocked<Pick<UserRepository, "findFullUserByUserId">>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockStripe.customers.retrieve.mockResolvedValue({ id: customerId, deleted: false });
        mockStripe.customers.update.mockResolvedValue({ id: customerId });
        mockStripe.checkout.sessions.list.mockResolvedValue({ data: [] });
        subscriptionRepo = createMockSubscriptionRepo();
        (subscriptionRepo.getSubscriptionByIdentifier as jest.Mock).mockResolvedValue(null);
        subscriptionService = createMockSubscriptionService();
        organizationRepo = createMockOrganizationRepo();
        userRepo = createMockUserRepo();
    });

    function service(): StripeService {
        return new StripeService(
            subscriptionRepo,
            subscriptionService as unknown as SubscriptionService,
            organizationRepo,
            userRepo as unknown as UserRepository
        );
    }

    describe("validateWebhook", () => {
        it("throws when webhook secret is not configured", () => {
            const { config } = jest.requireMock("../config/GlobalConfig") as {
                config: { stripe: { webhookSecret?: string } };
            };
            config.stripe.webhookSecret = "";
            expect(() => service().validateWebhook("{}", "sig")).toThrow(
                "Stripe webhook secret is not configured"
            );
            config.stripe.webhookSecret = "whsec_test";
        });

        it("returns the verified Stripe event", () => {
            const event = { id: "evt_1", type: "customer.subscription.updated" } as Stripe.Event;
            mockConstructEvent.mockReturnValue(event);
            expect(service().validateWebhook(Buffer.from("{}"), "sig_test")).toBe(event);
            expect(mockConstructEvent).toHaveBeenCalledWith(
                expect.any(Buffer),
                "sig_test",
                "whsec_test"
            );
        });

        it("adds CLI guidance when signature verification fails", () => {
            mockConstructEvent.mockImplementation(() => {
                throw new Error("No signatures found matching the expected signature");
            });
            expect(() => service().validateWebhook("{}", "bad")).toThrow(/stripe listen/);
        });
    });

    describe("createOrGetCustomer", () => {
        it("throws when organization billing profile is missing", async () => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue(null);
            await expect(service().createOrGetCustomer(organizationId)).rejects.toThrow(
                "Organization not found"
            );
        });

        it("returns existing Stripe customer id without creating a customer", async () => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            mockStripe.customers.retrieve.mockResolvedValue({ id: customerId, deleted: false });
            await expect(service().createOrGetCustomer(organizationId)).resolves.toBe(customerId);
            expect(mockStripe.customers.create).not.toHaveBeenCalled();
        });

        it("recreates customer when the stored Stripe customer was deleted in the Dashboard", async () => {
            const staleId = "cus_deleted_test";
            const newId = "cus_new_test";
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: staleId,
                allow_trial: false,
                is_trialing: false,
            });
            (organizationRepo.getTeam as jest.Mock).mockResolvedValue({
                members: [{ role: "owner", email: "owner@example.com" }],
            });
            mockStripe.customers.retrieve.mockRejectedValue(
                Stripe.errors.StripeInvalidRequestError.generate({
                    type: "invalid_request_error",
                    message: `No such customer: '${staleId}'`,
                    code: "resource_missing",
                })
            );
            mockStripe.customers.create.mockResolvedValue({ id: newId });
            await expect(service().createOrGetCustomer(organizationId)).resolves.toBe(newId);
            expect(subscriptionRepo.clearStripeCustomerId).toHaveBeenCalledWith(organizationId);
            expect(subscriptionRepo.updateStripeCustomerId).toHaveBeenCalledWith(
                organizationId,
                newId
            );
        });

        it("creates a Stripe customer from the workspace owner email", async () => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: null,
                allow_trial: true,
                is_trialing: false,
            });
            (organizationRepo.getTeam as jest.Mock).mockResolvedValue({
                members: [{ role: "owner", email: "owner@example.com", full_name: "Jane Owner" }],
            });
            mockStripe.customers.create.mockResolvedValue({ id: customerId });
            await expect(service().createOrGetCustomer(organizationId)).resolves.toBe(customerId);
            expect(mockStripe.customers.create).toHaveBeenCalledWith({
                email: "owner@example.com",
                name: "Jane Owner",
                metadata: { organizationId, service: "openquok" },
            });
            expect(subscriptionRepo.updateStripeCustomerId).toHaveBeenCalledWith(
                organizationId,
                customerId
            );
        });
    });

    describe("checkCheckoutStatus", () => {
        it("returns 2 when subscription row exists for checkout id", async () => {
            (subscriptionRepo.getSubscriptionByIdentifier as jest.Mock).mockResolvedValue({
                id: faker.string.uuid(),
                organization_id: organizationId,
            });
            await expect(service().checkCheckoutStatus(organizationId, checkoutId)).resolves.toEqual({
                status: 2,
                organizationId,
            });
        });

        it("returns 0 when no Stripe customer is linked", async () => {
            (subscriptionRepo.checkSubscriptionByIdentifier as jest.Mock).mockResolvedValue(null);
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: null,
                allow_trial: false,
                is_trialing: false,
            });
            await expect(service().checkCheckoutStatus(organizationId, checkoutId)).resolves.toEqual({
                status: 0,
            });
        });

        it("returns 1 when matching subscription was canceled", async () => {
            (subscriptionRepo.checkSubscriptionByIdentifier as jest.Mock).mockResolvedValue(null);
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            mockStripe.subscriptions.list.mockResolvedValue({
                data: [
                    {
                        metadata: { uniqueId: checkoutId },
                        canceled_at: 1_700_000_000,
                    },
                ],
            });
            await expect(service().checkCheckoutStatus(organizationId, checkoutId)).resolves.toEqual({
                status: 1,
            });
        });

        it("syncs and returns 2 when Stripe subscription is active but not yet in DB", async () => {
            (subscriptionRepo.checkSubscriptionByIdentifier as jest.Mock).mockResolvedValue(null);
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock)
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: faker.string.uuid() });
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            mockStripe.checkout.sessions.list.mockResolvedValue({ data: [] });
            const activeSub = stripeSubscription({
                metadata: { uniqueId: checkoutId, service: "openquok", billing: "SOLO", organizationId },
            });
            mockStripe.subscriptions.list.mockResolvedValue({ data: [activeSub] });

            await expect(service().checkCheckoutStatus(organizationId, checkoutId)).resolves.toEqual({
                status: 2,
                organizationId,
            });
            expect(subscriptionService.createOrUpdateFromStripe).toHaveBeenCalled();
        });

        it("syncs from a paid Checkout session when subscription metadata lacks uniqueId", async () => {
            (subscriptionRepo.checkSubscriptionByIdentifier as jest.Mock).mockResolvedValue(null);
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock)
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: faker.string.uuid() });
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            const activeSub = stripeSubscription({
                metadata: { service: "openquok", billing: "SOLO", organizationId },
            });
            mockStripe.checkout.sessions.list.mockResolvedValue({
                data: [
                    {
                        id: "cs_test",
                        metadata: {
                            uniqueId: checkoutId,
                            service: "openquok",
                            billing: "SOLO",
                            period: "MONTHLY",
                            organizationId,
                        },
                        payment_status: "paid",
                        status: "complete",
                        subscription: activeSub.id,
                    },
                ],
            });
            mockStripe.subscriptions.retrieve.mockResolvedValue(activeSub);
            mockStripe.subscriptions.list.mockResolvedValue({ data: [] });

            await expect(service().checkCheckoutStatus(organizationId, checkoutId)).resolves.toEqual({
                status: 2,
                organizationId,
            });
            expect(subscriptionService.createOrUpdateFromStripe).toHaveBeenCalledWith(
                expect.objectContaining({ identifier: checkoutId })
            );
        });

        it("returns 0 when Stripe subscription is active but sync does not persist", async () => {
            (subscriptionRepo.checkSubscriptionByIdentifier as jest.Mock).mockResolvedValue(null);
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockResolvedValue(null);
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            mockStripe.checkout.sessions.list.mockResolvedValue({ data: [] });
            const activeSub = stripeSubscription({
                metadata: { uniqueId: checkoutId, service: "other", billing: "SOLO", organizationId },
            });
            mockStripe.subscriptions.list.mockResolvedValue({ data: [activeSub] });

            await expect(service().checkCheckoutStatus(organizationId, checkoutId)).resolves.toEqual({
                status: 0,
            });
            expect(subscriptionService.createOrUpdateFromStripe).not.toHaveBeenCalled();
        });
    });

    describe("syncSubscriptionFromStripe", () => {
        it("ignores subscriptions from other services", async () => {
            await service().syncSubscriptionFromStripe(
                stripeSubscription({ metadata: { service: "other" } })
            );
            expect(subscriptionService.createOrUpdateFromStripe).not.toHaveBeenCalled();
        });

        it("ignores subscriptions without a paid tier in metadata", async () => {
            await service().syncSubscriptionFromStripe(
                stripeSubscription({ metadata: { service: "openquok", billing: "INVALID" } })
            );
            expect(subscriptionService.createOrUpdateFromStripe).not.toHaveBeenCalled();
        });

        it("skips upsert when organization is missing locally", async () => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue(null);
            await service().syncSubscriptionFromStripe(stripeSubscription());
            expect(subscriptionService.createOrUpdateFromStripe).not.toHaveBeenCalled();
        });

        it("upserts organization subscription from Stripe metadata", async () => {
            const sub = stripeSubscription({
                status: "trialing",
                cancel_at: 1_800_000_000,
            });
            await service().syncSubscriptionFromStripe(sub);
            expect(subscriptionService.createOrUpdateFromStripe).toHaveBeenCalledWith({
                organizationId,
                isTrialing: true,
                identifier: checkoutId,
                subscriptionTier: "SOLO",
                period: "MONTHLY",
                channelsPerWorkspace: pricing.SOLO.channel_per_workspace,
                cancelAt: new Date(1_800_000_000 * 1000).toISOString(),
                currentPeriodStart: null,
                currentPeriodEnd: null,
            });
        });
    });

    describe("handleWebhookEvent", () => {
        it("ignores events without openquok metadata", async () => {
            const event = {
                type: "customer.subscription.updated",
                data: { object: { metadata: { service: "other" } } },
            } as unknown as Stripe.Event;
            await service().handleWebhookEvent(event);
            expect(subscriptionService.createOrUpdateFromStripe).not.toHaveBeenCalled();
        });

        it("syncs subscription on created and updated events", async () => {
            const sub = stripeSubscription();
            const event = {
                type: "customer.subscription.updated",
                data: { object: sub },
            } as Stripe.Event;
            await service().handleWebhookEvent(event);
            expect(subscriptionService.createOrUpdateFromStripe).toHaveBeenCalled();
        });

        it("deletes local subscription on subscription.deleted", async () => {
            (subscriptionRepo.getOrganizationByStripeCustomerId as jest.Mock).mockResolvedValue({
                id: organizationId,
                stripe_customer_id: customerId,
            });
            const event = {
                type: "customer.subscription.deleted",
                data: { object: { customer: customerId, metadata: { service: "openquok" } } },
            } as unknown as Stripe.Event;
            await service().handleWebhookEvent(event);
            expect(subscriptionService.deleteSubscriptionForCustomer).toHaveBeenCalledWith(
                customerId
            );
        });

        it("deletes local subscription on subscription.deleted without openquok metadata", async () => {
            (subscriptionRepo.getOrganizationByStripeCustomerId as jest.Mock).mockResolvedValue({
                id: organizationId,
                stripe_customer_id: customerId,
            });
            const event = {
                type: "customer.subscription.deleted",
                data: { object: { customer: customerId, metadata: { service: "other" } } },
            } as unknown as Stripe.Event;
            await service().handleWebhookEvent(event);
            expect(subscriptionService.deleteSubscriptionForCustomer).toHaveBeenCalledWith(
                customerId
            );
            expect(subscriptionService.createOrUpdateFromStripe).not.toHaveBeenCalled();
        });

        it("ignores subscription.deleted when customer is unknown locally", async () => {
            (subscriptionRepo.getOrganizationByStripeCustomerId as jest.Mock).mockResolvedValue(
                null
            );
            const event = {
                type: "customer.subscription.deleted",
                data: { object: { customer: customerId } },
            } as unknown as Stripe.Event;
            await service().handleWebhookEvent(event);
            expect(subscriptionService.deleteSubscriptionForCustomer).not.toHaveBeenCalled();
        });
    });

    describe("reconcileSubscriptionWithStripe", () => {
        const dbRow = {
            id: faker.string.uuid(),
            organization_id: organizationId,
            subscription_tier: "SOLO" as const,
            period: "MONTHLY" as const,
            identifier: checkoutId,
            cancel_at: null,
            channels_per_workspace: pricing.SOLO.channel_per_workspace,
            is_lifetime: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
        };

        beforeEach(() => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            (subscriptionService.getEffectiveSubscription as jest.Mock).mockResolvedValue(dbRow);
        });

        it("soft-deletes DB row when Stripe has no open openquok subscription", async () => {
            mockStripe.subscriptions.list.mockResolvedValue({ data: [] });

            await service().reconcileSubscriptionWithStripe(organizationId);

            expect(subscriptionService.deleteSubscriptionForCustomer).toHaveBeenCalledWith(
                customerId
            );
            expect(subscriptionService.createOrUpdateFromStripe).not.toHaveBeenCalled();
        });

        it("syncs cancel_at from Stripe when subscription is scheduled to cancel", async () => {
            const scheduled = stripeSubscription({
                cancel_at_period_end: true,
                cancel_at: 1_800_000_000,
            });
            mockStripe.subscriptions.list.mockResolvedValue({ data: [scheduled] });

            await service().reconcileSubscriptionWithStripe(organizationId);

            expect(subscriptionService.createOrUpdateFromStripe).toHaveBeenCalledWith(
                expect.objectContaining({
                    organizationId,
                    cancelAt: new Date(1_800_000_000 * 1000).toISOString(),
                })
            );
            expect(subscriptionService.deleteSubscriptionForCustomer).not.toHaveBeenCalled();
        });

        it("skips reconcile for lifetime subscriptions", async () => {
            (subscriptionService.getEffectiveSubscription as jest.Mock).mockResolvedValue({
                ...dbRow,
                is_lifetime: true,
            });

            await service().reconcileSubscriptionWithStripe(organizationId);

            expect(mockStripe.subscriptions.list).not.toHaveBeenCalled();
        });
    });

    describe("subscribe", () => {
        beforeEach(() => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockResolvedValue(null);
            mockStripe.subscriptions.list.mockResolvedValue({ data: [] });
            mockStripe.checkout.sessions.create.mockResolvedValue({
                url: "https://checkout.stripe.com/session",
            });
            mockStripe.prices.retrieve.mockResolvedValue({
                active: true,
                unit_amount: pricing.SOLO.month_price * 100,
                recurring: { interval: "month" },
            });
        });

        it("creates a hosted checkout session for new subscriptions", async () => {
            const result = await service().subscribe({
                organizationId,
                userId,
                body: { period: "MONTHLY", billing: "SOLO", stripePriceId: priceId },
                allowTrial: true,
            });
            expect(result).toEqual({ url: "https://checkout.stripe.com/session" });
            expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    mode: "subscription",
                    customer: customerId,
                    subscription_data: expect.objectContaining({
                        // trial_period_days is in days - eg 7 days
                        trial_period_days: 7,
                        metadata: expect.objectContaining({
                            service: "openquok",
                            billing: "SOLO",
                            organizationId,
                        }),
                    }),
                    success_url: `https://app.example.com/account/billing?checkout=${checkoutId}`,
                })
            );
        });

        it("updates an existing Stripe subscription even when the DB row is missing", async () => {
            mockStripe.subscriptions.list.mockResolvedValue({
                data: [
                    stripeSubscription({
                        items: {
                            object: "list",
                            data: [{ id: "si_existing", price: { id: priceId } }],
                            has_more: false,
                            url: "/v1/subscription_items",
                        },
                    } as Partial<Stripe.Subscription>),
                ],
            });
            mockStripe.subscriptions.update.mockResolvedValue(stripeSubscription());
            const result = await service().subscribe({
                organizationId,
                userId,
                body: { period: "MONTHLY", billing: "SOLO", stripePriceId: priceId },
                allowTrial: false,
            });
            expect(result).toEqual({ updated: true });
            expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled();
            expect(mockStripe.subscriptions.update).toHaveBeenCalled();
        });

        it("returns billing portal URL when in-place subscription update fails", async () => {
            mockStripe.subscriptions.list.mockResolvedValue({
                data: [
                    stripeSubscription({
                        items: {
                            object: "list",
                            data: [{ id: "si_existing", price: { id: priceId } }],
                            has_more: false,
                            url: "/v1/subscription_items",
                        },
                    } as Partial<Stripe.Subscription>),
                ],
            });
            mockStripe.subscriptions.update.mockRejectedValue(new Error("Your card was declined."));
            mockStripe.billingPortal.sessions.create.mockResolvedValue({
                url: "https://billing.stripe.com/portal",
            });
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { full_name: "Jane Owner", email: "owner@example.com" },
            });

            const result = await service().subscribe({
                organizationId,
                userId,
                body: { period: "MONTHLY", billing: "SOLO", stripePriceId: priceId },
                allowTrial: false,
            });

            expect(result).toEqual({ portal: "https://billing.stripe.com/portal" });
            expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled();
        });

        it("rejects client price ids that do not match plan pricing", async () => {
            mockStripe.prices.retrieve.mockResolvedValue({
                active: true,
                unit_amount: 999,
                recurring: { interval: "month" },
            });
            await expect(
                service().subscribe({
                    organizationId,
                    userId,
                    body: { period: "MONTHLY", billing: "SOLO", stripePriceId: "price_wrong" },
                    allowTrial: false,
                })
            ).rejects.toBeInstanceOf(UserValidationError);
        });
    });

    describe("reactivateSubscription", () => {
        beforeEach(() => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            (subscriptionService.getEffectiveSubscription as jest.Mock).mockImplementation(
                async (orgId: string) =>
                    (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock)(orgId)
            );
        });

        it("clears cancel_at_period_end on the scheduled subscription and syncs DB", async () => {
            const scheduled = stripeSubscription({
                cancel_at_period_end: true,
                cancel_at: 1_800_000_000,
            });
            mockStripe.subscriptions.list.mockResolvedValue({ data: [scheduled] });
            mockStripe.subscriptions.update.mockResolvedValue(
                stripeSubscription({ cancel_at_period_end: false, cancel_at: null })
            );

            const result = await service().reactivateSubscription(organizationId);

            expect(result.id).toBe(checkoutId);
            expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
                scheduled.id,
                expect.objectContaining({ cancel_at_period_end: false })
            );
            expect(subscriptionService.createOrUpdateFromStripe).toHaveBeenCalledWith(
                expect.objectContaining({ organizationId, cancelAt: null })
            );
        });

        it("uses the effective subscription row from another workspace on the same account", async () => {
            const billingOrgId = faker.string.uuid();
            const scheduled = stripeSubscription({
                cancel_at_period_end: true,
                cancel_at: 1_800_000_000,
            });
            (subscriptionService.getEffectiveSubscription as jest.Mock).mockResolvedValue({
                id: faker.string.uuid(),
                organization_id: billingOrgId,
                subscription_tier: "TEAM",
                period: "MONTHLY",
                identifier: checkoutId,
                cancel_at: new Date(1_800_000_000 * 1000).toISOString(),
                channels_per_workspace: pricing.TEAM.channel_per_workspace,
                is_lifetime: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
            });
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockImplementation(
                async (orgId: string) => ({
                    id: orgId,
                    name: "Acme",
                    stripe_customer_id: customerId,
                    allow_trial: false,
                    is_trialing: false,
                })
            );
            mockStripe.subscriptions.list.mockResolvedValue({ data: [scheduled] });
            mockStripe.subscriptions.update.mockResolvedValue(
                stripeSubscription({ cancel_at_period_end: false, cancel_at: null })
            );

            await service().reactivateSubscription(organizationId, userId);

            expect(subscriptionService.getEffectiveSubscription).toHaveBeenCalledWith(
                organizationId,
                userId
            );
            expect(subscriptionRepo.getOrganizationBilling).toHaveBeenCalledWith(billingOrgId);
            expect(mockStripe.subscriptions.update).toHaveBeenCalled();
        });

        it("reactivates an open subscription when DB has cancel_at but Stripe is not flagged", async () => {
            const active = stripeSubscription({ cancel_at_period_end: false, cancel_at: null });
            (subscriptionService.getEffectiveSubscription as jest.Mock).mockResolvedValue({
                id: faker.string.uuid(),
                organization_id: organizationId,
                subscription_tier: "SOLO",
                period: "MONTHLY",
                identifier: checkoutId,
                cancel_at: new Date(1_800_000_000 * 1000).toISOString(),
                channels_per_workspace: pricing.SOLO.channel_per_workspace,
                is_lifetime: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
            });
            mockStripe.subscriptions.list.mockResolvedValue({ data: [active] });
            mockStripe.subscriptions.update.mockResolvedValue(active);

            await service().reactivateSubscription(organizationId);

            expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
                active.id,
                expect.objectContaining({ cancel_at_period_end: false })
            );
            expect(subscriptionService.createOrUpdateFromStripe).toHaveBeenCalled();
        });

        it("clears stale cancel_at in DB when Stripe has no open subscription", async () => {
            (subscriptionService.getEffectiveSubscription as jest.Mock).mockResolvedValue({
                id: faker.string.uuid(),
                organization_id: organizationId,
                subscription_tier: "SOLO",
                period: "MONTHLY",
                identifier: checkoutId,
                cancel_at: new Date(1_800_000_000 * 1000).toISOString(),
                channels_per_workspace: pricing.SOLO.channel_per_workspace,
                is_lifetime: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
            });
            mockStripe.subscriptions.list.mockResolvedValue({ data: [] });

            const result = await service().reactivateSubscription(organizationId);

            expect(result.id).toBe(checkoutId);
            expect(mockStripe.subscriptions.update).not.toHaveBeenCalled();
            expect(subscriptionService.createOrUpdateFromStripe).toHaveBeenCalledWith(
                expect.objectContaining({ organizationId, cancelAt: null })
            );
        });

        it("throws when neither Stripe nor DB indicates a scheduled cancellation", async () => {
            (subscriptionService.getEffectiveSubscription as jest.Mock).mockResolvedValue(null);
            mockStripe.subscriptions.list.mockResolvedValue({ data: [] });

            await expect(service().reactivateSubscription(organizationId)).rejects.toThrow(
                "No subscription scheduled for cancellation was found"
            );
        });
    });

    describe("previewProration", () => {
        it("returns zero when there is no active subscription", async () => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            mockStripe.subscriptions.list.mockResolvedValue({ data: [] });
            await expect(
                service().previewProration(organizationId, { billing: "SOLO", period: "MONTHLY" })
            ).resolves.toEqual({ price: 0 });
        });

        it("does not auto-create Stripe products when backend price id is missing", async () => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            mockStripe.subscriptions.list.mockResolvedValue({
                data: [stripeSubscription()],
            });
            await expect(
                service().previewProration(organizationId, { billing: "TEAM", period: "MONTHLY" })
            ).rejects.toBeInstanceOf(UserValidationError);
            expect(mockStripe.products.create).not.toHaveBeenCalled();
            expect(mockStripe.prices.create).not.toHaveBeenCalled();
        });

        it("returns amount_due from Stripe preview without billing_cycle_anchor now", async () => {
            const { config } = jest.requireMock("../config/GlobalConfig") as {
                config: { stripe: { priceIds: { TEAM: { monthly: string } } } };
            };
            config.stripe.priceIds.TEAM.monthly = "price_team_monthly";

            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            mockStripe.subscriptions.list.mockResolvedValue({
                data: [stripeSubscription()],
            });
            mockStripe.prices.retrieve.mockResolvedValue({
                active: true,
                id: "price_team_monthly",
                recurring: { interval: "month" },
            });
            mockStripe.invoices.createPreview.mockResolvedValue({
                amount_due: 1250,
                amount_remaining: 1250,
            });

            await expect(
                service().previewProration(organizationId, { billing: "TEAM", period: "MONTHLY" })
            ).resolves.toEqual({ price: 12.5 });

            const previewArgs = mockStripe.invoices.createPreview.mock.calls[0]?.[0] as {
                subscription_details?: Record<string, unknown>;
            };
            expect(previewArgs.subscription_details).toMatchObject({
                proration_behavior: "create_prorations",
                proration_date: expect.any(Number),
            });
            expect(previewArgs.subscription_details).not.toHaveProperty("billing_cycle_anchor");

            config.stripe.priceIds.TEAM.monthly = "";
        });
    });

    describe("listCharges", () => {
        it("returns an empty list when organization has no Stripe customer", async () => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: null,
                allow_trial: false,
                is_trialing: false,
            });
            await expect(service().listCharges(organizationId)).resolves.toEqual([]);
        });
    });

    describe("refundCharges", () => {
        it("throws when organization has no payment customer", async () => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: null,
                allow_trial: false,
                is_trialing: false,
            });
            await expect(service().refundCharges(organizationId, ["ch_1"])).rejects.toBeInstanceOf(
                UserValidationError
            );
        });
    });

    describe("checkDiscountEligible", () => {
        it("returns false when coupon or customer is missing", async () => {
            await expect(service().checkDiscountEligible(null)).resolves.toBe(false);
            const { config } = jest.requireMock("../config/GlobalConfig") as {
                config: { stripe: { discountCouponId?: string } };
            };
            config.stripe.discountCouponId = "";
            await expect(service().checkDiscountEligible(customerId)).resolves.toBe(false);
            config.stripe.discountCouponId = "coupon_retention";
        });
    });

    describe("getPackages", () => {
        it("returns catalog prices grouped by interval when billing is disabled", async () => {
            const { config } = jest.requireMock("../config/GlobalConfig") as {
                config: { stripe: { publishableKey?: string } };
            };
            config.stripe.publishableKey = "";
            await expect(service().getPackages()).resolves.toEqual({
                month: [
                    { name: "SOLO", recurring: "month", price: pricing.SOLO.month_price },
                    { name: "TEAM", recurring: "month", price: pricing.TEAM.month_price },
                    { name: "ULTIMATE", recurring: "month", price: pricing.ULTIMATE.month_price },
                    { name: "MAX", recurring: "month", price: pricing.MAX.month_price },
                ],
                year: [
                    { name: "SOLO", recurring: "year", price: pricing.SOLO.year_price },
                    { name: "TEAM", recurring: "year", price: pricing.TEAM.year_price },
                    { name: "ULTIMATE", recurring: "year", price: pricing.ULTIMATE.year_price },
                    { name: "MAX", recurring: "year", price: pricing.MAX.year_price },
                ],
            });
            config.stripe.publishableKey = "pk_test";
        });

        it("maps Stripe lookup-key prices when billing is enabled", async () => {
            mockStripe.prices.list.mockResolvedValue({
                data: [
                    {
                        active: true,
                        product: { name: "SOLO" },
                        recurring: { interval: "month" },
                        unit_amount: 2900,
                    },
                    {
                        active: true,
                        product: { name: "SOLO" },
                        recurring: { interval: "year" },
                        unit_amount: 27800,
                    },
                ],
            });
            await expect(service().getPackages()).resolves.toEqual({
                month: [{ name: "SOLO", recurring: "month", price: 29 }],
                year: [{ name: "SOLO", recurring: "year", price: 278 }],
            });
            expect(mockStripe.prices.list).toHaveBeenCalledWith(
                expect.objectContaining({
                    lookup_keys: expect.arrayContaining(["solo_monthly", "ultimate_yearly"]),
                })
            );
        });

        it("falls back to configured price ids when lookup keys return no rows", async () => {
            mockStripe.prices.list.mockResolvedValue({ data: [] });
            mockStripe.prices.retrieve.mockImplementation(async (id: string) => {
                if (id === "price_solo_monthly") {
                    return {
                        id,
                        active: true,
                        product: { name: "SOLO" },
                        recurring: { interval: "month" },
                        unit_amount: 2900,
                    };
                }
                return {
                    id,
                    active: true,
                    product: { name: "SOLO" },
                    recurring: { interval: "year" },
                    unit_amount: 27800,
                };
            });
            await expect(service().getPackages()).resolves.toEqual({
                month: [{ name: "SOLO", recurring: "month", price: 29 }],
                year: [{ name: "SOLO", recurring: "year", price: 278 }],
            });
            expect(mockStripe.prices.retrieve).toHaveBeenCalled();
        });
    });

    describe("createBillingPortalSession", () => {
        it("returns the billing portal session URL", async () => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: {
                    id: faker.string.uuid(),
                    auth_id: userId,
                    email: "member@example.com",
                    full_name: "Alex Member",
                },
                userError: null,
            });
            mockStripe.billingPortal.sessions.create.mockResolvedValue({
                url: "https://billing.stripe.com/session",
            });
            await expect(
                service().createBillingPortalSession(organizationId, userId)
            ).resolves.toBe("https://billing.stripe.com/session");
            expect(mockStripe.customers.update).toHaveBeenCalledWith(customerId, {
                name: "Alex Member",
                email: "member@example.com",
            });
            expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
                customer: customerId,
                return_url: "https://app.example.com/account/billing",
            });
        });
    });
});
