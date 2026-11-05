<script lang="ts">
	import type { PageData } from './$types';
	import type { CompareProductSlug } from '$lib/content/constants/competitors';
	import type { AlternativesHubFilters } from '$lib/content/constants/hubs/alternativesHubFilters';

	import { goto } from '$app/navigation';
	import { buildAlternativesHubUrl } from '$lib/content/constants/hubs/alternativesHubFilters';
	import { COMPARE_PRODUCT_ICON_STYLES_HUB } from '$lib/content/constants/competitors/compareProductIconStyles';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_DOCS_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';

	import { PUBLIC_ALTERNATIVES_HUB_FAQ } from '$lib/content/constants/hubs/alternatives';
	import { PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE } from '$lib/content/constants/hubs/productHubSocialVsDirectoryCompare';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import Compare from '$lib/ui/templates/Compare.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicAlternativesHubGrid from '$lib/ui/templates/landing-page/PublicAlternativesHubGrid.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);
	let hubVm = $derived(data.hubVm);
	let filtersVm = $derived(data.filtersVm);

	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const alternativesHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.alternatives;

	function iconStyleForProduct(slug: CompareProductSlug) {
		return COMPARE_PRODUCT_ICON_STYLES_HUB[slug];
	}

	function handleFiltersChange(overrides: Partial<AlternativesHubFilters>) {
		void goto(buildAlternativesHubUrl(filtersVm, overrides), { keepFocus: true });
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-0">
	<PublicAlternativesHubGrid
		{hubVm}
		{filtersVm}
		onFiltersChange={handleFiltersChange}
		{iconStyleForProduct}
	/>

	<Compare
		heroTheme={landingHeroTheme}
		headingId={PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE.schemaFragmentId}
		landingSubtitle={PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE.subtitle}
		landingTitle={PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE.title}
		landingDescription={PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE.description}
		leftTitle={PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE.leftTitle}
		rightTitle={PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE.rightTitle}
		points={[...PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE.points]}
		sectionClass="border-t border-base-content/10 bg-base-100 py-16 sm:py-20"
	/>

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={PUBLIC_ALTERNATIVES_HUB_FAQ.faqSubtitle}
			faqTitle={PUBLIC_ALTERNATIVES_HUB_FAQ.faqTitle}
			faqDescription={PUBLIC_ALTERNATIVES_HUB_FAQ.faqDescription}
			faqItems={[...PUBLIC_ALTERNATIVES_HUB_FAQ.faqItems]}
			sectionClass="py-12 sm:py-16"
		/>

		<AccentSplitCtaBanner
			title={alternativesHubDocsBanner.title}
			description={alternativesHubDocsBanner.description}
			ctaText={PUBLIC_DOCS_BANNER_CTA_TEXT}
			ctaHref={alternativesHubDocsBanner.docsPath}
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
