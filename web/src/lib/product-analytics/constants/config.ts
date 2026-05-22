/** PostHog project API key (public). */
export const POSTHOG_KEY =
	(typeof import.meta.env.VITE_PUBLIC_POSTHOG_KEY === 'string' &&
		import.meta.env.VITE_PUBLIC_POSTHOG_KEY.trim()) ||
	'';

/** PostHog ingest host, e.g. https://us.i.posthog.com */
export const POSTHOG_HOST =
	(typeof import.meta.env.VITE_PUBLIC_POSTHOG_HOST === 'string' &&
		import.meta.env.VITE_PUBLIC_POSTHOG_HOST.trim()) ||
	'';

/** Meta Pixel id for browser `fbq` (public). */
export const FACEBOOK_PIXEL_ID =
	(typeof import.meta.env.VITE_PUBLIC_FACEBOOK_PIXEL === 'string' &&
		import.meta.env.VITE_PUBLIC_FACEBOOK_PIXEL.trim()) ||
	'';

/** Stripe publishable key — when unset, product analytics events are skipped (self-hosted). */
export const STRIPE_PUBLISHABLE_KEY_FOR_ANALYTICS =
	(typeof import.meta.env.VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY === 'string' &&
		import.meta.env.VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY.trim()) ||
	'';

export function isPostHogConfigured(): boolean {
	return Boolean(POSTHOG_KEY && POSTHOG_HOST);
}

export function isFacebookPixelConfigured(): boolean {
	return Boolean(FACEBOOK_PIXEL_ID);
}

/** Mirrors hosted billing gate: no Stripe ⇒ no PostHog product events. */
export function isBillingEnabledForAnalytics(): boolean {
	return Boolean(STRIPE_PUBLISHABLE_KEY_FOR_ANALYTICS);
}
