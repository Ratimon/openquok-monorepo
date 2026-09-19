<script lang="ts">
	import type { PageData } from './$types';

	import { getPublicApiCapabilityPayloadValidatorHubSection } from '$lib/content/constants/apis/publicApiPayloadValidatorSectionConfig';
	import { getPublicPayloadValidatorHref } from '$lib/content/utils/getPublicPayloadValidatorHref';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import PublicApiMarketingFeatureRows from '$lib/ui/templates/api-marketing/PublicApiMarketingFeatureRows.svelte';
	import PublicApiMarketingHero from '$lib/ui/templates/api-marketing/PublicApiMarketingHero.svelte';
	import PublicApiMarketingHubGrid from '$lib/ui/templates/api-marketing/PublicApiMarketingHubGrid.svelte';
	import PublicApiMarketingPayloadValidatorSection from '$lib/ui/templates/api-marketing/PublicApiMarketingPayloadValidatorSection.svelte';
	import PublicApiMarketingStaticExampleBento from '$lib/ui/templates/api-marketing/PublicApiMarketingStaticExampleBento.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);
	let hubVm = $derived(data.hubVm);
	let platformsVm = $derived(data.platformsVm);
	let isLoggedIn = $derived(data.isLoggedIn);

	const payloadValidatorSection = getPublicApiCapabilityPayloadValidatorHubSection('scheduling');
	const payloadValidatorHref = getPublicPayloadValidatorHref();
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer>
	<PublicApiMarketingHero
		eyebrow="Scheduling API"
		title={hubVm.heroTitle}
		description={hubVm.heroDescription}
		{payloadValidatorHref}
	/>

	<PublicApiMarketingPayloadValidatorSection
		subtitle={payloadValidatorSection.subtitle}
		title={payloadValidatorSection.title}
		description={payloadValidatorSection.description}
		mediaOnRight={payloadValidatorSection.mediaOnRight}
		hubStaticExample={hubVm.staticExample}
		{isLoggedIn}
	/>

	<PublicApiMarketingStaticExampleBento staticExample={hubVm.staticExample} />

	<PublicApiMarketingHubGrid capability="scheduling" platformsVm={platformsVm} />

	<PublicApiMarketingFeatureRows />

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={hubVm.faqSubtitle}
			faqTitle={hubVm.faqTitle}
			faqDescription={hubVm.faqDescription}
			faqItems={[...hubVm.faqItems]}
			sectionClass="py-12 sm:py-16"
		/>
	</div>
</SectionOuterContainer>
