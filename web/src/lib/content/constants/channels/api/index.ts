/**
 * Public API marketing (Tier 2 pSEO) — `/social-media-posting-api/{slug}` and scheduling sibling.
 * Per-platform VMs: `posting/platforms/{slug}.ts` (posting + scheduling exports in one file).
 */
import type {
	PublicApiCapability,
	PublicApiPlatformPageViewModel,
	PublicApiPlatformSlug
} from './_shared/types';
import {
	PUBLIC_API_FOOTER_POPULAR_POSTING_SLUGS,
	PUBLIC_API_POSTING_PLATFORM_SLUGS,
	getPublicApiPostingHubPage,
	getPublicApiPostingPlatformBySlug,
	listPublicApiPostingPlatformsForHub
} from './posting/index';
import {
	PUBLIC_API_SCHEDULING_PLATFORM_SLUGS,
	getPublicApiSchedulingHubPage,
	getPublicApiSchedulingPlatformBySlug,
	listPublicApiSchedulingPlatformsForHub
} from './scheduling/index';

export * from './_shared/types';
export { publicApiPostingHubPage } from './posting/general';
export { publicApiSchedulingHubPage } from './scheduling/general';
export {
	PUBLIC_API_POSTING_HUB_FAQ,
	PUBLIC_API_SCHEDULING_HUB_FAQ,
	getPublicApiCapabilityHubFaq
} from './_shared/publicApiCapabilityHubFaqConfig';
export { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from './_shared/formatExamples';
export {
	PUBLIC_API_POSTING_HUB_STATIC_EXAMPLE,
	PUBLIC_API_SCHEDULING_HUB_STATIC_EXAMPLE
} from './_shared/hubExamples';
export {
	PUBLIC_API_POSTING_HUB_SETUP_STEPS,
	PUBLIC_API_SCHEDULING_HUB_SETUP_STEPS,
	getPublicApiHubSetupStepsSection,
	getPublicApiPlatformSetupStepsSection
} from './_shared/publicApiCapabilityHubSetupStepsConfig';
export {
	getPublicApiHubAudienceSection,
	getPublicApiPlatformAudienceSection
} from './_shared/publicApiCapabilityAudienceConfig';
export { getPublicApiHubWorkflowSection } from './_shared/publicApiCapabilityHubWorkflowConfig';
export {
	PUBLIC_API_MARKETING_HUB_FEATURE_SECTIONS,
	getPublicApiHubFeatureSections,
	getPublicApiPlatformFeatureSections
} from './_shared/publicApiCapabilityHubFeatureConfig';
export {
	getPublicPricingLandingPlanOverrides,
	getPublicPricingLandingSection,
	type PublicPricingLandingContext,
	type PublicPricingLandingPlanOverrides,
	type PublicPricingLandingPresetId,
	type PublicPricingLandingSection
} from '$lib/billing/constants/publicPricingLandingSectionConfig';
export {
	SHARED_PUBLIC_API_SEO_KEYWORDS,
	PUBLIC_API_CREATE_POST_ENDPOINT,
	PUBLIC_API_CLOUD_PUBLIC_BASE_URL,
	PUBLIC_API_PROGRAMMATIC_AUTH_CURL_HEADER,
	buildPublicApiCreatePostResponseExample,
	buildPublicApiCreatePostTerminalCode,
	buildPublicApiFormatExample,
	buildPublicApiIntegrationsListTerminalCode,
	buildPublicApiPlatformHubCard,
	getPublicApiProviderIdentifier
} from './_shared/shared';

export {
	PUBLIC_API_POSTING_PLATFORM_SLUGS,
	PUBLIC_API_FOOTER_POPULAR_POSTING_SLUGS,
	getPublicApiPostingHubPage,
	getPublicApiPostingPlatformBySlug,
	listPublicApiPostingPlatformsForHub
};

export {
	PUBLIC_API_SCHEDULING_PLATFORM_SLUGS,
	getPublicApiSchedulingHubPage,
	getPublicApiSchedulingPlatformBySlug,
	listPublicApiSchedulingPlatformsForHub
};

export function isPublicApiPlatformSlug(value: string): value is PublicApiPlatformSlug {
	const key = value.trim().toLowerCase();
	return (PUBLIC_API_POSTING_PLATFORM_SLUGS as readonly string[]).includes(key);
}

export function getPublicApiPlatformBySlug(
	capability: PublicApiCapability,
	slug: string
): PublicApiPlatformPageViewModel | undefined {
	return capability === 'posting'
		? getPublicApiPostingPlatformBySlug(slug)
		: getPublicApiSchedulingPlatformBySlug(slug);
}
