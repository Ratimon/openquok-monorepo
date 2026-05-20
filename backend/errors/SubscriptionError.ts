import type { SubscriptionSection } from "openquok-common";

export class SubscriptionError extends Error {
    readonly statusCode = 402;
    readonly section: SubscriptionSection | null;
    readonly billingUrl: string;

    constructor(message: string, section: SubscriptionSection | null, billingUrl: string) {
        super(message);
        this.name = "SubscriptionError";
        this.section = section;
        this.billingUrl = billingUrl;
    }
}
