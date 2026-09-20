<script lang="ts">
	import { page } from '$app/state';

	import type { PublicApiCapability, PublicApiPlatformSlug } from '$lib/content/constants/apis/types';
	import {
		getPublicApiHubSetupStepsSection,
		getPublicApiPlatformSetupStepsSection
	} from '$lib/content/constants/apis/publicApiCapabilityHubSetupStepsConfig';
	import { getPublicApiSetupStepsFooter } from '$lib/content/constants/publicSetupStepsFooterConfig';
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
	const setupStepsFooter = $derived(getPublicApiSetupStepsFooter());
	const gettingStartedHref = $derived(
		hostedMarketingHref(setupStepsFooter.footerLinkHref, page.url.origin)
	);
</script>

<FeaturesOrdered
	steps={[...section.setupSteps]}
	heroTheme={landingHeroTheme}
	sectionSubtitle={section.setupStepsSubtitle}
	sectionTitle={section.setupStepsTitle}
	sectionDescription={section.setupStepsDescription}
	footerPrompt={setupStepsFooter.footerPrompt}
	footerLinkLabel={setupStepsFooter.footerLinkLabel}
	footerLinkHref={gettingStartedHref}
/>
