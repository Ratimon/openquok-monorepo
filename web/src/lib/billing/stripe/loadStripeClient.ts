import type { Stripe } from '@stripe/stripe-js';

import { loadStripe } from '@stripe/stripe-js';

import { browser } from '$app/environment';

import { STRIPE_PUBLISHABLE_KEY } from '$lib/billing/constants/config';

/** Origins Stripe Checkout Elements contacts while the card form boots. */
const STRIPE_PRECONNECT_ORIGINS = [
	'https://js.stripe.com',
	'https://api.stripe.com',
	'https://m.stripe.network'
] as const;

let stripePromise: Promise<Stripe | null> | null = null;
let preconnectDone = false;

/** Hint the browser to open connections before `loadStripe` injects its script. */
export function ensureStripePreconnect(): void {
	if (!browser || preconnectDone || typeof document === 'undefined') return;
	preconnectDone = true;
	for (const href of STRIPE_PRECONNECT_ORIGINS) {
		if (document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) continue;
		const link = document.createElement('link');
		link.rel = 'preconnect';
		link.href = href;
		link.crossOrigin = 'anonymous';
		document.head.appendChild(link);
	}
}

/**
 * Start (or reuse) the Stripe.js download. Call as soon as first-billing may show
 * so `js.stripe.com` loads in parallel with `POST /billing/embedded`.
 */
export function preloadStripe(): Promise<Stripe | null> {
	if (!browser) return Promise.resolve(null);
	ensureStripePreconnect();
	if (!STRIPE_PUBLISHABLE_KEY) return Promise.resolve(null);
	if (!stripePromise) {
		stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY).catch((error) => {
			stripePromise = null;
			throw error;
		});
	}
	return stripePromise;
}
