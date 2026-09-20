<script lang="ts">
	import { page } from '$app/state';

	import type { PublicApiCapability, PublicApiPlatformSlug } from '$lib/content/constants/apis/types';
	import {
		getPublicApiHubSetupStepsSection,
		getPublicApiPlatformSetupStepsSection
	} from '$lib/content/constants/apis/publicApiCapabilityHubSetupStepsConfig';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import FeaturesOrdered from '$lib/ui/templates/FeaturesOrdered.svelte';

	type Props = {
		capability: PublicApiCapability;
		platformLabel?: string | null;
		platformSlug?: PublicApiPlatformSlug | null;
		platformRequestJson?: string | null;
	};

	let {
		capability,
		platformLabel = null,
		platformSlug = null,
		platformRequestJson = null
	}: Props = $props();

	const section = $derived(
		platformLabel?.trim() && platformSlug
			? getPublicApiPlatformSetupStepsSection(
					capability,
					platformLabel.trim(),
					platformSlug,
					platformRequestJson
				)
			: getPublicApiHubSetupStepsSection(capability)
	);
	const gettingStartedHref = $derived(
		hostedMarketingHref('/docs/getting-started-for-public-api', page.url.origin)
	);
</script>

<FeaturesOrdered
	steps={[...section.setupSteps]}
	heroTheme={landingHeroTheme}
	sectionSubtitle={section.setupStepsSubtitle}
	sectionTitle={section.setupStepsTitle}
	sectionDescription={section.setupStepsDescription}
	footerPrompt={section.setupStepsFooterPrompt}
	footerLinkLabel={section.setupStepsFooterLinkLabel}
	footerLinkHref={gettingStartedHref}
/>
