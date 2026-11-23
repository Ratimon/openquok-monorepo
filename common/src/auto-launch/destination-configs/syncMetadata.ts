/**
 * Sync tooling metadata for `destination-configs/*.ts` → SQL seed artifacts.
 * Consumed by backend sync scripts and unit tests.
 *
 * Per-site derivation rules live under sites/<site>/sync.ts and merge here.
 */

import {
	mergeExtensionConfigDerivations,
	pricingQueueDerivations,
	type ExtensionConfigDerivation,
	type ExtensionConfigDerivationBySlug,
} from './extensionConfigDerivation.js';
import { DEVHUNT_EXTENSION_CONFIG_DERIVATIONS } from './sites/devhunt/sync.js';
import { FAZIER_EXTENSION_CONFIG_DERIVATIONS } from './sites/fazier/sync.js';
import { OPEN_LAUNCH_EXTENSION_CONFIG_DERIVATIONS } from './sites/open-launch/sync.js';
import { PEERPUSH_EXTENSION_CONFIG_DERIVATIONS } from './sites/peerpush/sync.js';
import { TINYLAUNCH_EXTENSION_CONFIG_DERIVATIONS } from './sites/tinylaunch/sync.js';
import {
	UNEED_EXTENSION_CONFIG_DERIVATIONS,
	UNEED_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	UNEED_SITE_KEY,
} from './sites/uneed/sync.js';

export type { ExtensionConfigDerivation, ExtensionConfigDerivationBySlug } from './extensionConfigDerivation.js';
export {
	FAZIER_EXTENSION_CONFIG_DERIVATIONS,
	FAZIER_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	FAZIER_SITE_KEY,
} from './sites/fazier/sync.js';
export {
	UNEED_EXTENSION_CONFIG_DERIVATIONS,
	UNEED_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	UNEED_SITE_KEY,
} from './sites/uneed/sync.js';

/** Generated migration artifact filename (tier 5xx). Bump when replacing the module. */
export const AUTO_LAUNCH_EXTENSION_CONFIGS_SQL = '502_20261111_extension_configs.sql';

/** Merged extension fixture derivation rules for all shipped directory sites. */
export const AUTO_LAUNCH_EXTENSION_CONFIG_DERIVATIONS: ExtensionConfigDerivationBySlug =
	mergeExtensionConfigDerivations(
		PEERPUSH_EXTENSION_CONFIG_DERIVATIONS,
		OPEN_LAUNCH_EXTENSION_CONFIG_DERIVATIONS,
		TINYLAUNCH_EXTENSION_CONFIG_DERIVATIONS,
		UNEED_EXTENSION_CONFIG_DERIVATIONS,
		FAZIER_EXTENSION_CONFIG_DERIVATIONS,
		DEVHUNT_EXTENSION_CONFIG_DERIVATIONS
	);

/** Subset used by extension + destination sync pricing-queue checks. */
export const AUTO_LAUNCH_PRICING_QUEUE_VARIANT_DERIVED = pricingQueueDerivations(
	AUTO_LAUNCH_EXTENSION_CONFIG_DERIVATIONS
);

/** @deprecated alias — prefer {@link AUTO_LAUNCH_PRICING_QUEUE_VARIANT_DERIVED} */
export const AUTO_LAUNCH_EXTENSION_CONFIG_PRICING_READY_HINT_DERIVED =
	AUTO_LAUNCH_PRICING_QUEUE_VARIANT_DERIVED;

/** @deprecated alias */
export type AutoLaunchPricingQueueVariantDerived = { baseProviderSlug: string };

/** @deprecated alias */
export const AUTO_LAUNCH_DESTINATION_SEED_PRICING_START_URL_DERIVED =
	AUTO_LAUNCH_PRICING_QUEUE_VARIANT_DERIVED;

/** Destination seed SQL uses `generationMode: 'composite'` (manual prelude + generated block). */
export const AUTO_LAUNCH_COMPOSITE_DESTINATION_SEED_SITE_KEYS = [UNEED_SITE_KEY] as const;

export type AutoLaunchCompositeDestinationSeedSiteKey =
	(typeof AUTO_LAUNCH_COMPOSITE_DESTINATION_SEED_SITE_KEYS)[number];