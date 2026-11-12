import type { AutoLaunchExtensionConfig } from '../../browser-extension/pageAssist.js';
import {
	OPEN_LAUNCH_FREE_LAUNCH_EXTENSION_CONFIG,
	OPEN_LAUNCH_PREMIUM_LAUNCH_EXTENSION_CONFIG,
} from './openLaunch.js';
import {
	PEERPUSH_FREE_QUEUE_EXTENSION_CONFIG,
	PEERPUSH_STANDARD_LAUNCH_EXTENSION_CONFIG,
} from './peerpush.js';
import {
	UNEED_JOIN_LINE_EXTENSION_CONFIG,
	UNEED_MAKER_PROFILE_EXTENSION_CONFIG,
	UNEED_PAID_LAUNCH_EXTENSION_CONFIG,
} from './uneed.js';

export {
	OPEN_LAUNCH_FREE_LAUNCH_EXTENSION_CONFIG,
	OPEN_LAUNCH_PREMIUM_LAUNCH_EXTENSION_CONFIG,
} from './openLaunch.js';
export {
	PEERPUSH_FREE_QUEUE_EXTENSION_CONFIG,
	PEERPUSH_STANDARD_LAUNCH_EXTENSION_CONFIG,
} from './peerpush.js';
export {
	UNEED_JOIN_LINE_EXTENSION_CONFIG,
	UNEED_MAKER_PROFILE_EXTENSION_CONFIG,
	UNEED_PAID_LAUNCH_EXTENSION_CONFIG,
} from './uneed.js';

/** Typed mirrors of shipped `auto_launch_destinations.extension_config` (not a runtime DB override). */
export const DIRECTORY_EXTENSION_CONFIG_FIXTURES: Record<string, AutoLaunchExtensionConfig> = {
	'peerpush-standard-launch': PEERPUSH_STANDARD_LAUNCH_EXTENSION_CONFIG,
	'peerpush-free-queue': PEERPUSH_FREE_QUEUE_EXTENSION_CONFIG,
	'uneed-join-line': UNEED_JOIN_LINE_EXTENSION_CONFIG,
	'uneed-paid-launch': UNEED_PAID_LAUNCH_EXTENSION_CONFIG,
	'uneed-maker-profile': UNEED_MAKER_PROFILE_EXTENSION_CONFIG,
	'open-launch-premium-launch': OPEN_LAUNCH_PREMIUM_LAUNCH_EXTENSION_CONFIG,
	'open-launch-free-launch': OPEN_LAUNCH_FREE_LAUNCH_EXTENSION_CONFIG,
};

export const DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS = Object.keys(
	DIRECTORY_EXTENSION_CONFIG_FIXTURES
) as (keyof typeof DIRECTORY_EXTENSION_CONFIG_FIXTURES)[];

export function getDirectoryExtensionConfigFixture(
	providerSlug: string
): AutoLaunchExtensionConfig | undefined {
	return DIRECTORY_EXTENSION_CONFIG_FIXTURES[providerSlug];
}

export {
	AUTO_LAUNCH_EXTENSION_CONFIGS_SQL,
	AUTO_LAUNCH_EXTENSION_CONFIG_PRICING_READY_HINT_DERIVED,
} from './syncMetadata.js';

export {
	directoryLaunchProviders,
	getDirectoryLaunchProvider,
	getDirectoryLaunchSiteKeyFromLocation,
	getDirectoryLaunchUniqueHostPatterns,
	isDirectoryLaunchProviderId,
	listDirectoryLaunchProviderSummaries,
	resolveDirectoryLaunchStartUrl,
} from './directoryLaunchRegistry.js';

export {
	OPEN_LAUNCH_DIRECTORY_LAUNCH_PROVIDERS,
	OPEN_LAUNCH_HOST_PATTERNS,
	OPEN_LAUNCH_HOST_PERMISSION,
} from './openLaunch.js';
export {
	PEERPUSH_DIRECTORY_LAUNCH_PROVIDERS,
	PEERPUSH_HOST_PATTERNS,
	PEERPUSH_HOST_PERMISSION,
} from './peerpush.js';
export {
	UNEED_DIRECTORY_LAUNCH_PROVIDERS,
	UNEED_HOST_PATTERNS,
	UNEED_HOST_PERMISSION,
} from './uneed.js';

export {
	LAUNCH_FIELD_CATALOG_IDS,
	applySelectCoercionForField,
	catalogListFillSkipMessage,
	catalogTagsDomFillSkipMessage,
	fieldHasLaunchFieldCatalog,
	filterItemsForLaunchField,
	invalidProfileChoicesForField,
	invalidSelectForField,
	resolveLaunchFieldCatalogId,
	selectPresetsForField,
	type LaunchFieldCatalogId,
} from './fieldCatalogRegistry.js';

export {
	UNEED_OFFICIAL_CATEGORY_LABELS,
	UNEED_OFFICIAL_TAG_LABELS,
	coerceToUneedOfficialCategory,
	coerceUneedPricingType,
	filterToUneedOfficialTags,
	isUneedOfficialTag,
	matchUneedOfficialCategory,
	matchUneedOfficialTag,
	normalizeUneedCategoryLabel,
	normalizeUneedTagLabel,
	type UneedOfficialCategoryLabel,
	type UneedOfficialTagLabel,
	uneedSelectCatalogOptions,
} from './uneed.js';
