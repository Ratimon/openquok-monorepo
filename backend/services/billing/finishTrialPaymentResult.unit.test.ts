/// <reference types="jest" />
import type Stripe from "stripe";

import {
    finishTrialResultFromSubscription,
    isTrialConversionFinishedStatus,
} from "./finishTrialPaymentResult";

function subscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
    return {
        id: "sub_test",
        object: "subscription",
        status: "active",
        ...overrides,
    } as Stripe.Subscription;
}

describe("finishTrialResultFromSubscription", () => {
    it("returns finished when subscription is active", () => {
        expect(finishTrialResultFromSubscription(subscription({ status: "active" }))).toEqual({
            finished: true,
        });
    });

    it("returns requiresAction when payment intent needs authentication", () => {
        const result = finishTrialResultFromSubscription(
            subscription({
                status: "past_due",
                latest_invoice: {
                    id: "in_test",
                    object: "invoice",
                    status: "open",
                    payment_intent: {
                        id: "pi_test",
                        object: "payment_intent",
                        status: "requires_action",
                        client_secret: "pi_test_secret",
                    },
                } as unknown as Stripe.Invoice,
            })
        );

        expect(result).toEqual({
            finished: false,
            requiresAction: true,
            clientSecret: "pi_test_secret",
        });
    });

    it("returns paymentFailed when payment method is invalid", () => {
        const result = finishTrialResultFromSubscription(
            subscription({
                status: "past_due",
                latest_invoice: {
                    id: "in_test",
                    object: "invoice",
                    status: "open",
                    payment_intent: {
                        id: "pi_test",
                        object: "payment_intent",
                        status: "requires_payment_method",
                        client_secret: "pi_test_secret",
                    },
                } as unknown as Stripe.Invoice,
            })
        );

        expect(result.finished).toBe(false);
        expect(result.paymentFailed).toBe(true);
        expect(result.message).toContain("payment method");
    });
});

describe("isTrialConversionFinishedStatus", () => {
    it("is true only for active status", () => {
        expect(isTrialConversionFinishedStatus("active")).toBe(true);
        expect(isTrialConversionFinishedStatus("past_due")).toBe(false);
        expect(isTrialConversionFinishedStatus("trialing")).toBe(false);
    });
});
