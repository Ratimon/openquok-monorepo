<script lang="ts">
	import type { PageData } from './$types';
	import type { CompareProductSlug } from '$lib/content/constants/publicCompareConfig';

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
	import ListingsSearchBar from '$lib/ui/templates/listings/ListingsSearchBar.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
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

	const PRODUCT_ICON_STYLES: Record<
		CompareProductSlug,
		{ containerClass: string; iconClass?: string }
	> = {
		openquok: {
			containerClass:
				'bg-linear-to-br from-emerald-400/30 via-lime-300/20 to-amber-300/25 text-white ring-emerald-300/35'
		},
		hootsuite: {
			containerClass:
				'bg-linear-to-br from-orange-400/30 via-amber-300/20 to-yellow-300/20 text-orange-100 ring-orange-300/35'
		},
		buffer: {
			containerClass:
				'bg-linear-to-br from-sky-400/30 via-cyan-300/20 to-blue-300/20 text-sky-100 ring-sky-300/35'
		},
		mixpost: {
			containerClass:
				'bg-linear-to-br from-indigo-500/30 via-violet-400/20 to-cyan-300/20 text-indigo-100 ring-indigo-400/35'
		},
		'post-bridge': {
			containerClass:
				'bg-linear-to-br from-rose-400/30 via-orange-300/20 to-amber-300/20 text-rose-100 ring-rose-300/35'
		},
		postiz: {
			containerClass:
				'bg-linear-to-br from-violet-400/30 via-purple-300/20 to-fuchsia-300/20 text-violet-100 ring-violet-300/35'
		},
		typefully: {
			containerClass:
				'bg-linear-to-br from-blue-500/30 via-indigo-400/20 to-sky-300/20 text-blue-100 ring-blue-400/35'
		}
	};

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const alternativesHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.alternatives;

	function iconStyleForProduct(slug: CompareProductSlug) {
		return PRODUCT_ICON_STYLES[slug];
	}

	function handleSearchChange(value: string) {
		searchQuery = value;
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">
			{hubVm.eyebrow}
		</p>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
			{hubVm.title}
		</h1>
		<p class="mx-auto max-w-2xl text-base text-base-content/70">
			{hubVm.description}
		</p>
	</header>

	<div class="container mx-auto max-w-5xl px-4 pt-8">
		<ListingsSearchBar
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
