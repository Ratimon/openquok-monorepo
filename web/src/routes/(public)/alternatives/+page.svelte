<script lang="ts">
	import type { PageData } from './$types';
	import type { CompareProductSlug } from '$lib/content/constants/competitors';

	import { COMPARE_PRODUCT_ICON_STYLES_HUB } from '$lib/content/constants/competitors/compareProductIconStyles';
	import { publicAlternativesPagePresenter } from '$lib/area-public';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_DOCS_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicHubSearchBar from '$lib/ui/templates/public-hub/PublicHubSearchBar.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import PublicAlternativesLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicAlternativesLandingBreadcrumb.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);
	let hubVm = $derived(data.hubVm);

	let searchQuery = $state('');
	let filteredEntries = $derived(
		publicAlternativesPagePresenter.filterHubEntries(hubVm.entries, searchQuery)
	);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const alternativesHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.alternatives;

	function iconStyleForProduct(slug: CompareProductSlug) {
		return COMPARE_PRODUCT_ICON_STYLES_HUB[slug];
	}

	function handleSearchChange(value: string) {
		searchQuery = value;
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<div class="flex justify-center">
			<PublicAlternativesLandingBreadcrumb variant="hub" />
		</div>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
			{hubVm.title}
		</h1>
		<p class="mx-auto max-w-2xl text-base text-base-content/70">
			{hubVm.description}
		</p>
	</header>

	<div class="container mx-auto max-w-5xl px-4 pt-8">
		<PublicHubSearchBar
			bind:value={searchQuery}
			placeholder="Search alternatives…"
			onchange={handleSearchChange}
		/>
	</div>

	<SimpleCardGrid
		heroTheme={{
			subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase',
			parseLandingHeroTitlePartSegments: (text: string) => [{ text, highlight: false }]
		}}
		headingId="public-alternatives-grid-heading"
		title=""
		items={filteredEntries.map((entry) => ({
			id: entry.slug,
			title: entry.title,
			iconName: entry.icon,
			iconContainerClass: iconStyleForProduct(entry.slug).containerClass,
			iconClass: iconStyleForProduct(entry.slug).iconClass,
			href: entry.href,
			description: entry.description,
			ctaLabel: 'Compare tools'
		}))}
		getItemKey={(item) => item.id}
		sectionClass="pt-10 pb-0"
		patternComponent={StripedPattern}
		patternClass="text-primary/12 stroke-[0.75]"
	>
		{#snippet card(item, context)}
			<SimpleLinkCard
				{item}
				pattern={context.pattern}
				patternComponent={context.patternComponent}
				patternClass={context.patternClass}
			/>
		{/snippet}
	</SimpleCardGrid>

	{#if filteredEntries.length === 0}
		<p class="container mx-auto max-w-5xl px-4 pt-8 text-center text-base text-base-content/60">
			No alternatives matched your search. Try another tool name.
		</p>
	{/if}

	<div class="container mx-auto px-4">
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
