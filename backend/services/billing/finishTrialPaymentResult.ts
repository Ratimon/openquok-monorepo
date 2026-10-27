import type Stripe from "stripe";

export type FinishTrialResult = {
    finished: boolean;
    requiresAction?: boolean;
    clientSecret?: string;
    paymentFailed?: boolean;
    message?: string;
};

export function isTrialConversionFinishedStatus(status: Stripe.Subscription.Status): boolean {
    if (status === "trialing") return false;
    return status === "active";
}

type InvoiceWithPaymentIntent = Stripe.Invoice & {
    payment_intent?: Stripe.PaymentIntent | string | null;
};

export function paymentIntentFromSubscription(
    subscription: Stripe.Subscription
): Stripe.PaymentIntent | null {
    const invoice = subscription.latest_invoice;
    if (!invoice || typeof invoice === "string") return null;
    const paymentIntent = (invoice as InvoiceWithPaymentIntent).payment_intent;
    if (!paymentIntent || typeof paymentIntent === "string") return null;
    return paymentIntent;
}

export function finishTrialResultFromSubscription(
    subscription: Stripe.Subscription
): FinishTrialResult {
    if (subscription.status === "active") {
        return { finished: true };
    }
    if (subscription.status === "trialing") {
        return { finished: false, message: "Trial is still active." };
    }

    const paymentIntent = paymentIntentFromSubscription(subscription);
    if (paymentIntent?.status === "requires_action" && paymentIntent.client_secret) {
        return {
            finished: false,
            requiresAction: true,
            clientSecret: paymentIntent.client_secret,
        };
    }

    if (
        paymentIntent?.status === "requires_payment_method" ||
        subscription.status === "past_due" ||
        subscription.status === "incomplete" ||
        subscription.status === "unpaid"
    ) {
        return {
            finished: false,
            paymentFailed: true,
            message:
                "We could not charge your payment method. Update your card in Payment details and try again.",
        };
    }

    return {
        finished: false,
        message: "Subscription payment is still processing. Try again in a moment.",
    };
}
