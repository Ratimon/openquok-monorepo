import type { PaidSubscriptionTier, SubscriptionPeriod } from './types.js';

/** Env key for a Stripe Price id (`price_…`) — set on the backend only. */
export function stripePriceEnvKey(tier: PaidSubscriptionTier, period: SubscriptionPeriod): string {
	const periodKey = period === 'MONTHLY' ? 'MONTHLY' : 'YEARLY';
	return `STRIPE_PRICE_ID_${tier}_${periodKey}`;
}
