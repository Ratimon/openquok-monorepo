import {
    PAID_SUBSCRIPTION_TIERS,
    stripePriceEnvKey,
    type PaidSubscriptionTier,
    type SubscriptionPeriod,
} from "openquok-common";

import { getEnvTrimmed } from "./envHelper";

export type StripePriceIdMap = Record<
    PaidSubscriptionTier,
    { monthly: string; yearly: string }
>;

export function loadStripePriceIds(): StripePriceIdMap {
    const out = {} as StripePriceIdMap;
    for (const tier of PAID_SUBSCRIPTION_TIERS) {
        out[tier] = {
            monthly: getEnvTrimmed(stripePriceEnvKey(tier, "MONTHLY"), ""),
            yearly: getEnvTrimmed(stripePriceEnvKey(tier, "YEARLY"), ""),
        };
    }
    return out;
}

export function configuredStripePriceId(
    priceIds: StripePriceIdMap,
    tier: PaidSubscriptionTier,
    period: SubscriptionPeriod
): string | null {
    const row = priceIds[tier];
    const id = period === "MONTHLY" ? row.monthly : row.yearly;
    const trimmed = id?.trim();
    return trimmed ? trimmed : null;
}
