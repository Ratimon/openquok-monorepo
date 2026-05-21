import { getStripeClient } from "./stripe";

describe("Stripe declined payments", () => {
    describe("test payment method declines", () => {
        it("generic decline", async () => {
            const stripe = getStripeClient();

            await expect(
                stripe.paymentIntents.create({
                    amount: 500,
                    currency: "gbp",
                    confirm: true,
                    payment_method: "pm_card_visa_chargeDeclined",
                    return_url: "https://example.com/return",
                })
            ).rejects.toMatchObject({
                statusCode: 402,
                code: "card_declined",
                decline_code: "generic_decline",
            });
        });

        it("insufficient funds decline", async () => {
            const stripe = getStripeClient();

            await expect(
                stripe.paymentIntents.create({
                    amount: 500,
                    currency: "gbp",
                    confirm: true,
                    payment_method: "pm_card_visa_chargeDeclinedInsufficientFunds",
                    return_url: "https://example.com/return",
                })
            ).rejects.toMatchObject({
                statusCode: 402,
                code: "card_declined",
                decline_code: "insufficient_funds",
            });
        });

        it("lost card decline", async () => {
            const stripe = getStripeClient();

            await expect(
                stripe.paymentIntents.create({
                    amount: 500,
                    currency: "gbp",
                    confirm: true,
                    payment_method: "pm_card_visa_chargeDeclinedLostCard",
                    return_url: "https://example.com/return",
                })
            ).rejects.toMatchObject({
                statusCode: 402,
                code: "card_declined",
                decline_code: "lost_card",
            });
        });

        it("stolen card decline", async () => {
            const stripe = getStripeClient();

            await expect(
                stripe.paymentIntents.create({
                    amount: 500,
                    currency: "gbp",
                    confirm: true,
                    payment_method: "pm_card_visa_chargeDeclinedStolenCard",
                    return_url: "https://example.com/return",
                })
            ).rejects.toMatchObject({
                statusCode: 402,
                code: "card_declined",
                decline_code: "stolen_card",
            });
        });

        it("expired card decline", async () => {
            const stripe = getStripeClient();

            await expect(
                stripe.paymentIntents.create({
                    amount: 500,
                    currency: "gbp",
                    confirm: true,
                    payment_method: "pm_card_chargeDeclinedExpiredCard",
                    return_url: "https://example.com/return",
                })
            ).rejects.toMatchObject({
                statusCode: 402,
                code: "expired_card",
            });
        });

        it("processing error decline", async () => {
            const stripe = getStripeClient();

            await expect(
                stripe.paymentIntents.create({
                    amount: 500,
                    currency: "gbp",
                    confirm: true,
                    payment_method: "pm_card_chargeDeclinedProcessingError",
                    return_url: "https://example.com/return",
                })
            ).rejects.toMatchObject({
                statusCode: 402,
                code: "processing_error",
                decline_code: "processing_error",
            });
        });

        it("incorrect CVC decline", async () => {
            const stripe = getStripeClient();

            await expect(
                stripe.paymentIntents.create({
                    amount: 500,
                    currency: "gbp",
                    confirm: true,
                    payment_method: "pm_card_chargeDeclinedIncorrectCvc",
                    return_url: "https://example.com/return",
                })
            ).rejects.toMatchObject({
                statusCode: 402,
                code: "incorrect_cvc",
            });
        });
    });
});
