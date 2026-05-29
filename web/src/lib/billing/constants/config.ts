import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';

const STRIPE_PRICE_ID_SOLO_MONTHLY = String(
	import.meta.env.VITE_PUBLIC_STRIPE_PRICE_ID_SOLO_MONTHLY ?? ''
).trim();
const STRIPE_PRICE_ID_SOLO_YEARLY = String(
	import.meta.env.VITE_PUBLIC_STRIPE_PRICE_ID_SOLO_YEARLY ?? ''
).trim();
const STRIPE_PRICE_ID_TEAM_MONTHLY = String(
	import.meta.env.VITE_PUBLIC_STRIPE_PRICE_ID_TEAM_MONTHLY ?? ''
).trim();
const STRIPE_PRICE_ID_TEAM_YEARLY = String(
	import.meta.env.VITE_PUBLIC_STRIPE_PRICE_ID_TEAM_YEARLY ?? ''
).trim();
const STRIPE_PRICE_ID_ULTIMATE_MONTHLY = String(
	import.meta.env.VITE_PUBLIC_STRIPE_PRICE_ID_ULTIMATE_MONTHLY ?? ''
).trim();
const STRIPE_PRICE_ID_ULTIMATE_YEARLY = String(
	import.meta.env.VITE_PUBLIC_STRIPE_PRICE_ID_ULTIMATE_YEARLY ?? ''
).trim();
const STRIPE_PRICE_ID_MAX_MONTHLY = String(
	import.meta.env.VITE_PUBLIC_STRIPE_PRICE_ID_MAX_MONTHLY ?? ''
).trim();
const STRIPE_PRICE_ID_MAX_YEARLY = String(
	import.meta.env.VITE_PUBLIC_STRIPE_PRICE_ID_MAX_YEARLY ?? ''
).trim();

const PRICE_IDS: Record<PaidSubscriptionTier, Record<SubscriptionPeriod, string>> = {
	SOLO: { MONTHLY: STRIPE_PRICE_ID_SOLO_MONTHLY, YEARLY: STRIPE_PRICE_ID_SOLO_YEARLY },
	TEAM: { MONTHLY: STRIPE_PRICE_ID_TEAM_MONTHLY, YEARLY: STRIPE_PRICE_ID_TEAM_YEARLY },
	ULTIMATE: { MONTHLY: STRIPE_PRICE_ID_ULTIMATE_MONTHLY, YEARLY: STRIPE_PRICE_ID_ULTIMATE_YEARLY },
	MAX: { MONTHLY: STRIPE_PRICE_ID_MAX_MONTHLY, YEARLY: STRIPE_PRICE_ID_MAX_YEARLY }
};

/** Stripe publishable key for optional client-side Stripe.js usage. */
export const STRIPE_PUBLISHABLE_KEY = String(
	import.meta.env.VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
).trim();

/** Resolve Dashboard `price_…` id for a tier and billing cadence. */
export function stripePriceIdForTier(
	tier: PaidSubscriptionTier,
	period: SubscriptionPeriod
): string | null {
	const id = PRICE_IDS[tier]?.[period]?.trim();
	return id ? id : null;
}
