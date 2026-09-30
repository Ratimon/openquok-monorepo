/**
 * Shared **marketing chrome** for `/` and public hub templates — not per-channel pSEO.
 *
 * Channel identity (`/channels/{slug}`) lives in `channels/catalog/platforms/`.
 * The `/self-hosting` page uses `self-hosting/landing.ts` (single-route config, not this folder).
 */
export * from '$lib/content/constants/landing/breadcrumbs';
export * from '$lib/content/constants/landing/hero-copy';
export * from '$lib/content/constants/landing/setup-steps-footer';
export * from '$lib/content/constants/landing/who-is-for';
