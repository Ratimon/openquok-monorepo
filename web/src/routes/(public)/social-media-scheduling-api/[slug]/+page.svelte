<script lang="ts">
	import type { PageData } from './$types';

	import { getPublicApiPlatformFeatureSections } from '$lib/content/constants/apis/publicApiCapabilityHubFeatureConfig';
	import { buildPublicApiPayloadValidatorStaticExampleFromFormatExample } from '$lib/content/constants/apis/hubExamples';
	import { getPublicApiCapabilityPayloadValidatorHubSection } from '$lib/content/constants/apis/publicApiPayloadValidatorSectionConfig';
	import { getPublicPayloadValidatorHref } from '$lib/content/utils/getPublicPayloadValidatorHref';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import PublicApiMarketingFormatExplorer from '$lib/ui/templates/api-marketing/PublicApiMarketingFormatExplorer.svelte';
	import PublicApiMarketingFeatureRows from '$lib/ui/templates/api-marketing/PublicApiMarketingFeatureRows.svelte';
	import PublicApiMarketingHero from '$lib/ui/templates/api-marketing/PublicApiMarketingHero.svelte';
	import PublicApiMarketingHubSetupSteps from '$lib/ui/templates/api-marketing/PublicApiMarketingHubSetupSteps.svelte';
	import PublicApiMarketingPayloadValidatorSection from '$lib/ui/templates/api-marketing/PublicApiMarketingPayloadValidatorSection.svelte';
	import PublicApiMarketingSiblingGrid from '$lib/ui/templates/api-marketing/PublicApiMarketingSiblingGrid.svelte';
	import PublicApiMarketingWhoIsFor from '$lib/ui/templates/api-marketing/PublicApiMarketingWhoIsFor.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);
	let platformVm = $derived(data.platformVm);
	let platformsVm = $derived(data.platformsVm);
	let isLoggedIn = $derived(data.isLoggedIn);

	const payloadValidatorSection = $derived(
		getPublicApiCapabilityPayloadValidatorHubSection(platformVm.capability)
	);
	const payloadValidatorStaticExample = $derived.by(() => {
		const firstExample = platformVm.formatExamples[0];
		if (!firstExample) return null;
		return buildPublicApiPayloadValidatorStaticExampleFromFormatExample(firstExample);
	});
	const payloadValidatorHref = $derived(getPublicPayloadValidatorHref(platformVm.slug));
	const featureSections = $derived(
		getPublicApiPlatformFeatureSections(
			platformVm.capability,
			platformVm.platformLabel,
			platformVm.slug,
			platformVm.formatExamples[0]?.requestJson
		)
	);
</script>

<JsonLdHead schemaData={schemaData} />

{#key platformVm.slug}
	<SectionOuterContainer>
		<PublicApiMarketingHero
			capability="scheduling"
			platformLabel={platformVm.platformLabel}
			title={platformVm.heroTitle}
			description={platformVm.heroDescription}
			payloadValidatorHref={payloadValidatorHref}
		/>

		<PublicApiMarketingWhoIsFor capability="scheduling" platformLabel={platformVm.platformLabel} />

		<PublicApiMarketingHubSetupSteps
			capability="scheduling"
			platformLabel={platformVm.platformLabel}
			platformSlug={platformVm.slug}
			platformRequestJson={platformVm.formatExamples[0]?.requestJson}
		/>

		{#if payloadValidatorStaticExample}
			<PublicApiMarketingPayloadValidatorSection
				subtitle={payloadValidatorSection.subtitle}
				title={payloadValidatorSection.title}
				description={payloadValidatorSection.description}
				mediaOnRight={payloadValidatorSection.mediaOnRight}
				hubStaticExample={payloadValidatorStaticExample}
				platformSlug={platformVm.slug}
				{isLoggedIn}
			/>
		{/if}

		<PublicApiMarketingFormatExplorer formatExamples={platformVm.formatExamples} />

		<PublicApiMarketingSiblingGrid
			capability="scheduling"
			platformsVm={platformsVm}
			activeSlug={platformVm.slug}
			activePlatformLabel={platformVm.platformLabel}
			publicApiProvidersDocsPath={platformVm.publicApiProvidersDocsPath}
		/>

		<PublicApiMarketingFeatureRows sections={featureSections} />

		<div class="container mx-auto px-4">
			<PublicFaq
				heroTheme={landingHeroTheme}
				faqSubtitle={platformVm.faqSubtitle}
				faqTitle={platformVm.faqTitle}
				faqDescription={platformVm.faqDescription}
				faqItems={[...platformVm.faqItems]}
				sectionClass="py-12 sm:py-16"
			/>
		</div>
	</SectionOuterContainer>
{/key}
