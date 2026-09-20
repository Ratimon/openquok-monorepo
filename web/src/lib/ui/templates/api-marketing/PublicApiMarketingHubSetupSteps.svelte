<script lang="ts">
	import { page } from '$app/state';

	import type { PublicApiCapability } from '$lib/content/constants/apis/types';
	import { getPublicApiHubSetupStepsSection } from '$lib/content/constants/apis/publicApiCapabilityHubSetupStepsConfig';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import FeaturesOrdered from '$lib/ui/templates/FeaturesOrdered.svelte';

	type Props = {
		capability: PublicApiCapability;
	};

	let { capability }: Props = $props();

	const section = $derived(getPublicApiHubSetupStepsSection(capability));
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
