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
	DEVHUNT_PAID_LAUNCH_EXTENSION_CONFIG,
	DEVHUNT_STANDARD_LAUNCH_EXTENSION_CONFIG,
	DEVHUNT_TOOL_FORM_EXTENSION_CONFIG,
} from './devhunt.js';
import {
	NICK_LAUNCHES_FREE_LAUNCH_EXTENSION_CONFIG,
	NICK_LAUNCHES_MAKER_PROFILE_EXTENSION_CONFIG,
	NICK_LAUNCHES_PAID_LAUNCH_EXTENSION_CONFIG,
} from './nick-launches.js';
import {
	INDIEHUB_BASIC_LAUNCH_EXTENSION_CONFIG,
	INDIEHUB_PRO_LAUNCH_EXTENSION_CONFIG,
} from './indiehub.js';
import {
	ALTERNATIVETO_FINISH_LISTING_EXTENSION_CONFIG,
	ALTERNATIVETO_FREE_LISTING_EXTENSION_CONFIG,
	ALTERNATIVETO_PRIORITY_REVIEW_EXTENSION_CONFIG,
	ALTERNATIVETO_USER_PROFILE_EXTENSION_CONFIG,
} from './alternativeto.js';
import { TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG } from './trustpilot.js';
import {
	FAZIER_FREE_PRODUCT_LISTING_EXTENSION_CONFIG,
	FAZIER_PAID_PRODUCT_LISTING_EXTENSION_CONFIG,
	FAZIER_PAGE_EXTENSION_CONFIG,
} from './fazier.js';
import {
	TINYLAUNCH_PREMIUM_LAUNCH_EXTENSION_CONFIG,
	TINYLAUNCH_STANDARD_LAUNCH_EXTENSION_CONFIG,
} from './tinylaunch.js';
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
	DEVHUNT_PAID_LAUNCH_EXTENSION_CONFIG,
	DEVHUNT_STANDARD_LAUNCH_EXTENSION_CONFIG,
	DEVHUNT_TOOL_FORM_EXTENSION_CONFIG,
} from './devhunt.js';
export {
	NICK_LAUNCHES_FREE_LAUNCH_EXTENSION_CONFIG,
	NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG,
	NICK_LAUNCHES_MAKER_PROFILE_EXTENSION_CONFIG,
	NICK_LAUNCHES_PAID_LAUNCH_EXTENSION_CONFIG,
} from './nick-launches.js';
export {
	INDIEHUB_BASIC_LAUNCH_EXTENSION_CONFIG,
	INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG,
	INDIEHUB_PRO_LAUNCH_EXTENSION_CONFIG,
} from './indiehub.js';
export {
	ALTERNATIVETO_FINISH_LISTING_EXTENSION_CONFIG,
	ALTERNATIVETO_FREE_LISTING_EXTENSION_CONFIG,
	ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG,
	ALTERNATIVETO_PRIORITY_REVIEW_EXTENSION_CONFIG,
	ALTERNATIVETO_USER_PROFILE_EXTENSION_CONFIG,
} from './alternativeto.js';
export {
	TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG,
	TRUSTPILOT_DIRECTORY_LAUNCH_PROVIDERS,
	TRUSTPILOT_HOST_PATTERNS,
	TRUSTPILOT_HOST_PERMISSION,
} from './trustpilot.js';
export {
	FAZIER_FREE_PRODUCT_LISTING_EXTENSION_CONFIG,
	FAZIER_PAID_PRODUCT_LISTING_EXTENSION_CONFIG,
	FAZIER_PAGE_EXTENSION_CONFIG,
} from './fazier.js';
export {
	TINYLAUNCH_PREMIUM_LAUNCH_EXTENSION_CONFIG,
	TINYLAUNCH_STANDARD_LAUNCH_EXTENSION_CONFIG,
} from './tinylaunch.js';
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
	'tinylaunch-premium-launch': TINYLAUNCH_PREMIUM_LAUNCH_EXTENSION_CONFIG,
	'tinylaunch-standard-launch': TINYLAUNCH_STANDARD_LAUNCH_EXTENSION_CONFIG,
	'fazier-page': FAZIER_PAGE_EXTENSION_CONFIG,
	'fazier-free-product-listing': FAZIER_FREE_PRODUCT_LISTING_EXTENSION_CONFIG,
	'fazier-paid-product-listing': FAZIER_PAID_PRODUCT_LISTING_EXTENSION_CONFIG,
	'devhunt-paid-launch': DEVHUNT_PAID_LAUNCH_EXTENSION_CONFIG,
	'devhunt-standard-launch': DEVHUNT_STANDARD_LAUNCH_EXTENSION_CONFIG,
	'nick-launches-free-launch': NICK_LAUNCHES_FREE_LAUNCH_EXTENSION_CONFIG,
	'nick-launches-paid-launch': NICK_LAUNCHES_PAID_LAUNCH_EXTENSION_CONFIG,
	'nick-launches-maker-profile': NICK_LAUNCHES_MAKER_PROFILE_EXTENSION_CONFIG,
	'indiehub-basic-launch': INDIEHUB_BASIC_LAUNCH_EXTENSION_CONFIG,
	'indiehub-pro-launch': INDIEHUB_PRO_LAUNCH_EXTENSION_CONFIG,
	'alternativeto-free-listing': ALTERNATIVETO_FREE_LISTING_EXTENSION_CONFIG,
	'alternativeto-priority-review': ALTERNATIVETO_PRIORITY_REVIEW_EXTENSION_CONFIG,
	'alternativeto-finish-listing': ALTERNATIVETO_FINISH_LISTING_EXTENSION_CONFIG,
	'alternativeto-user-profile': ALTERNATIVETO_USER_PROFILE_EXTENSION_CONFIG,
	'trustpilot-company-profile': TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG,
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
	AUTO_LAUNCH_COMPOSITE_DESTINATION_SEED_SITE_KEYS,
	AUTO_LAUNCH_EXTENSION_CONFIG_DERIVATIONS,
	AUTO_LAUNCH_EXTENSION_CONFIGS_SQL,
	AUTO_LAUNCH_DESTINATION_SEED_PRICING_START_URL_DERIVED,
	AUTO_LAUNCH_EXTENSION_CONFIG_PRICING_READY_HINT_DERIVED,
	AUTO_LAUNCH_PRICING_QUEUE_VARIANT_DERIVED,
	type AutoLaunchCompositeDestinationSeedSiteKey,
	type AutoLaunchPricingQueueVariantDerived,
	UNEED_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	NICK_LAUNCHES_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	INDIEHUB_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	ALTERNATIVETO_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	TRUSTPILOT_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
} from './syncMetadata.js';

export {
	validateIndependentExtensionFixtureSlugs,
	validatePricingQueueExtensionFixtures,
	type ExtensionConfigDerivation,
	type ExtensionConfigDerivationBySlug,
} from './extensionConfigDerivation.js';

export {
	AUTO_LAUNCH_DESTINATION_SEED_MODULES,
	AUTO_LAUNCH_DESTINATION_SEED_PROVIDER_SLUGS,
	AUTO_LAUNCH_DESTINATION_SEED_ROWS,
	AUTO_LAUNCH_DESTINATION_SEEDS_GENERATED_MARKER_END,
	AUTO_LAUNCH_DESTINATION_SEEDS_GENERATED_MARKER_START,
	type AutoLaunchDestinationSeedGenerationMode,
	type AutoLaunchDestinationSeedModule,
	type AutoLaunchDestinationSeedRow,
} from './destinationSeeds.js';

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
	DEVHUNT_DIRECTORY_LAUNCH_PROVIDERS,
	DEVHUNT_HOST_PATTERNS,
	DEVHUNT_HOST_PERMISSION,
} from './devhunt.js';
export {
	NICK_LAUNCHES_DIRECTORY_LAUNCH_PROVIDERS,
	NICK_LAUNCHES_HOST_PATTERNS,
	NICK_LAUNCHES_HOST_PERMISSION,
} from './nick-launches.js';
export {
	INDIEHUB_DIRECTORY_LAUNCH_PROVIDERS,
	INDIEHUB_HOST_PATTERNS,
	INDIEHUB_HOST_PERMISSION,
} from './indiehub.js';
export {
	ALTERNATIVETO_DIRECTORY_LAUNCH_PROVIDERS,
	ALTERNATIVETO_HOST_PATTERNS,
	ALTERNATIVETO_HOST_PERMISSION,
} from './alternativeto.js';
export {
	FAZIER_DIRECTORY_LAUNCH_PROVIDERS,
	FAZIER_HOST_PATTERNS,
	FAZIER_HOST_PERMISSION,
} from './fazier.js';
export {
	TINYLAUNCH_DIRECTORY_LAUNCH_PROVIDERS,
	TINYLAUNCH_HOST_PATTERNS,
	TINYLAUNCH_HOST_PERMISSION,
} from './tinylaunch.js';
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
	DEVHUNT_OFFICIAL_PRICING_LABELS,
	coerceToDevhuntOfficialPricing,
	devhuntSelectCatalogOptions,
	matchDevhuntOfficialPricing,
	type DevhuntOfficialPricingLabel,
} from './devhunt.js';
export {
	NICK_LAUNCHES_OFFICIAL_CATEGORY_LABELS,
	NICK_LAUNCHES_OFFICIAL_PRICING_VALUES,
	coerceToNickLaunchesOfficialPricing,
	filterToNickLaunchesOfficialCategories,
	matchNickLaunchesOfficialCategory,
	matchNickLaunchesOfficialPricing,
	nickLaunchesSelectCatalogOptions,
	type NickLaunchesOfficialCategoryLabel,
	type NickLaunchesOfficialPricingValue,
} from './nick-launches.js';
export {
	INDIEHUB_OFFICIAL_CATEGORY_LABELS,
	filterToIndiehubOfficialCategories,
	matchIndiehubOfficialCategory,
	type IndiehubOfficialCategoryLabel,
} from './indiehub.js';
export {
	ALTERNATIVETO_OFFICIAL_LICENSE_LABELS,
	ALTERNATIVETO_OFFICIAL_PLATFORM_LABELS,
	alternativetoSelectCatalogOptions,
	coerceToAlternativetoOfficialLicense,
	filterToAlternativetoOfficialPlatforms,
	mapBusinessProfilePricingToAlternativetoLicense,
	matchAlternativetoOfficialLicense,
	matchAlternativetoOfficialPlatform,
	type AlternativetoOfficialLicenseLabel,
	type AlternativetoOfficialPlatformLabel,
} from './alternativeto.js';
export {
	TINYLAUNCH_OFFICIAL_CATEGORY_LABELS,
	coerceToTinylaunchOfficialCategory,
	matchTinylaunchOfficialCategory,
	normalizeTinylaunchCategoryLabel,
	type TinylaunchOfficialCategoryLabel,
	tinylaunchSelectCatalogOptions,
} from './tinylaunch.js';
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
