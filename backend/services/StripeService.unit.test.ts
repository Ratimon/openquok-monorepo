/// <reference types="jest" />
import type Stripe from "stripe";
import { faker } from "@faker-js/faker";
import { pricing } from "openquok-common";

import { UserValidationError } from "../errors/UserError";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";
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
    customers: { create: jest.fn() },
    prices: { retrieve: jest.fn(), list: jest.fn(), create: jest.fn() },
    products: { list: jest.fn(), create: jest.fn() },
    subscriptions: {
        list: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
    },
    checkout: { sessions: { create: jest.fn() } },
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
            webhookSecret: "whsec_test",
            priceIds: {
                SOLO: { monthly: "price_solo_monthly", yearly: "price_solo_yearly" },
                CREATOR: { monthly: "", yearly: "" },
                TEAM: { monthly: "", yearly: "" },
                ULTIMATE: { monthly: "", yearly: "" },
            },
            discountCouponId: "coupon_retention",
        },
    },
}));

jest.mock("../utils/ids/makeId", () => ({
    makeId: jest.fn(() => checkoutId),
}));

function createMockSubscriptionRepo(): jest.Mocked<SubscriptionRepository> {
    return {
        getOrganizationBilling: jest.fn(),
        updateStripeCustomerId: jest.fn(),
        getSubscriptionByOrganizationId: jest.fn(),
        checkSubscriptionByIdentifier: jest.fn(),
        getOrganizationByStripeCustomerId: jest.fn(),
        setTrialing: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;
}

function createMockSubscriptionService(): jest.Mocked<
    Pick<SubscriptionService, "createOrUpdateFromStripe" | "deleteSubscriptionForCustomer">
> {
    return {
        createOrUpdateFromStripe: jest.fn().mockResolvedValue(undefined),
        deleteSubscriptionForCustomer: jest.fn().mockResolvedValue(undefined),
    };
}

function createMockOrganizationRepo(): jest.Mocked<OrganizationRepository> {
    return {
        getTeam: jest.fn(),
    } as unknown as jest.Mocked<OrganizationRepository>;
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

    beforeEach(() => {
        jest.clearAllMocks();
        subscriptionRepo = createMockSubscriptionRepo();
        subscriptionService = createMockSubscriptionService();
        organizationRepo = createMockOrganizationRepo();
    });

    function service(): StripeService {
        return new StripeService(
            subscriptionRepo,
            subscriptionService as unknown as SubscriptionService,
            organizationRepo
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
            await expect(service().createOrGetCustomer(organizationId)).resolves.toBe(customerId);
            expect(mockStripe.customers.create).not.toHaveBeenCalled();
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
                members: [{ role: "owner", email: "owner@example.com" }],
            });
            mockStripe.customers.create.mockResolvedValue({ id: customerId });
            await expect(service().createOrGetCustomer(organizationId)).resolves.toBe(customerId);
            expect(mockStripe.customers.create).toHaveBeenCalledWith({
                email: "owner@example.com",
                name: "Acme",
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
            (subscriptionRepo.checkSubscriptionByIdentifier as jest.Mock).mockResolvedValue({
                id: faker.string.uuid(),
            });
            await expect(service().checkCheckoutStatus(organizationId, checkoutId)).resolves.toBe(2);
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
            await expect(service().checkCheckoutStatus(organizationId, checkoutId)).resolves.toBe(0);
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
            await expect(service().checkCheckoutStatus(organizationId, checkoutId)).resolves.toBe(1);
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
                totalChannels: pricing.SOLO.channel_per_workspace,
                cancelAt: new Date(1_800_000_000 * 1000).toISOString(),
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
            const event = {
                type: "customer.subscription.deleted",
                data: { object: { customer: customerId, metadata: { service: "openquok" } } },
            } as unknown as Stripe.Event;
            await service().handleWebhookEvent(event);
            expect(subscriptionService.deleteSubscriptionForCustomer).toHaveBeenCalledWith(
                customerId
            );
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

    describe("createBillingPortalSession", () => {
        it("returns the billing portal session URL", async () => {
            (subscriptionRepo.getOrganizationBilling as jest.Mock).mockResolvedValue({
                id: organizationId,
                name: "Acme",
                stripe_customer_id: customerId,
                allow_trial: false,
                is_trialing: false,
            });
            mockStripe.billingPortal.sessions.create.mockResolvedValue({
                url: "https://billing.stripe.com/session",
            });
            await expect(service().createBillingPortalSession(organizationId)).resolves.toBe(
                "https://billing.stripe.com/session"
            );
            expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
                customer: customerId,
                return_url: "https://app.example.com/account/billing",
            });
        });
    });
});
