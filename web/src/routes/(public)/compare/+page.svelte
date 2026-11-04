<script lang="ts">
	import type { PageData } from './$types';

	import { publicComparePagePresenter } from '$lib/area-public';
	import { COMPARE_HUB_BASE_SLUG, type CompareProductSlug } from '$lib/content/constants/competitors';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';
	import { PUBLIC_COMPARE_HUB_FAQ } from '$lib/content/constants/hubs/compare';
	import { COMPARE_PRODUCT_ICON_STYLES_HUB } from '$lib/content/constants/competitors/compareProductIconStyles';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicCompareHubGrid from '$lib/ui/templates/landing-page/PublicCompareHubGrid.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);

	let selectedBaseSlug = $state<CompareProductSlug>(COMPARE_HUB_BASE_SLUG);
	let hubVm = $derived(publicComparePagePresenter.buildHubVm(selectedBaseSlug));

	function selectBaseProduct(slug: CompareProductSlug) {
		selectedBaseSlug = slug;
	}

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const compareHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.compare;

	function iconStyleForProduct(slug: CompareProductSlug) {
		return COMPARE_PRODUCT_ICON_STYLES_HUB[slug];
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-0">
	<PublicCompareHubGrid
		{hubVm}
		{selectedBaseSlug}
		onSelectBaseProduct={selectBaseProduct}
		{iconStyleForProduct}
	/>

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={PUBLIC_COMPARE_HUB_FAQ.faqSubtitle}
			faqTitle={PUBLIC_COMPARE_HUB_FAQ.faqTitle}
			faqDescription={PUBLIC_COMPARE_HUB_FAQ.faqDescription}
			faqItems={[...PUBLIC_COMPARE_HUB_FAQ.faqItems]}
			sectionClass="py-12 sm:py-16"
		/>

		<AccentSplitCtaBanner
			title={compareHubDocsBanner.title}
			description={compareHubDocsBanner.description}
			ctaText={compareHubDocsBanner.ctaText}
			ctaHref={compareHubDocsBanner.docsPath}
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
