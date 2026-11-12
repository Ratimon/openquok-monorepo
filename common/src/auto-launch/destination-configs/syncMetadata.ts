/**
 * Sync tooling metadata for `destination-configs/*.ts` → `505_*_extension_configs.sql`.
 * Consumed by `backend/scripts/sync-auto-launch-extension-configs.mjs` and unit tests.
 */

/** Generated migration artifact filename (tier 5xx). Bump when replacing the module. */
export const AUTO_LAUNCH_EXTENSION_CONFIGS_SQL = '505_20261111_extension_configs.sql';

/** Pricing-queue slugs must set `readyUrlHint: 'pricing'` explicitly in TS (no SQL `jsonb_set`). */
export const AUTO_LAUNCH_EXTENSION_CONFIG_PRICING_READY_HINT_DERIVED: Record<
	string,
	{ baseProviderSlug: string }
> = {
	'peerpush-free-queue': { baseProviderSlug: 'peerpush-standard-launch' },
	'open-launch-free-launch': { baseProviderSlug: 'open-launch-premium-launch' },
};
