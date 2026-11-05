<script lang="ts">
	import type { AlternativesHubViewModel } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';
	import type { CompareProductSlug } from '$lib/content/constants/competitors';
	import type {
		AlternativesHubCategory,
		AlternativesHubFilters,
		AlternativesHubSort
	} from '$lib/content/constants/hubs/alternativesHubFilters';

	import {
		landingHeroTheme,
		PUBLIC_SOCIAL_AUTOPILOT_HERO_TITLE_LINE_CLASS
	} from '$lib/ui/templates/landing-page/landingHeroTheme';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';
	import PublicAlternativesHubSectionHeading from '$lib/ui/components/alternatives/PublicAlternativesHubSectionHeading.svelte';
	import PublicAlternativesHubToolbar from '$lib/ui/templates/alternatives/PublicAlternativesHubToolbar.svelte';
	import PublicAlternativesLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicAlternativesLandingBreadcrumb.svelte';
	import PublicHubSearchBar from '$lib/ui/templates/public-hub/PublicHubSearchBar.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';

	type ProductIconStyle = {
		containerClass: string;
		iconClass?: string;
	};

	type Props = {
		hubVm: AlternativesHubViewModel;
		filtersVm: AlternativesHubFilters;
		onFiltersChange: (overrides: Partial<AlternativesHubFilters>) => void;
		iconStyleForProduct: (slug: CompareProductSlug) => ProductIconStyle;
	};

	let { hubVm, filtersVm, onFiltersChange, iconStyleForProduct }: Props = $props();

	let searchDraft = $state('');

	$effect(() => {
		searchDraft = filtersVm.search ?? '';
	});

	const showSocialSection = $derived(
		filtersVm.category === 'all' || filtersVm.category === 'social'
	);
	const showDirectorySection = $derived(
		filtersVm.category === 'all' || filtersVm.category === 'directory'
	);

	function applySearch() {
		const term = searchDraft.trim();
		onFiltersChange({ search: term || undefined });
	}

	const headingId = 'public-alternatives-hub-heading';

	const cardGridHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase'
	};

	const heroHighlightGradientClass = $derived(
		`${landingHeroTheme.titleSegmentClassWithOffset(
			0,
			[{ text: hubVm.heroHighlightText, highlight: false }],
			1
		)} inline-block shrink-0 pl-[0.2em] sm:pl-[0.28em]`
	);

	/** Avoid `text-balance` on flex hero titles — it can visually merge adjacent word spans. */
	const alternativesHubHeroTitleClass =
		'text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl';

	function entryCardItems(section: AlternativesHubViewModel['socialSection']) {
		return section.entries.map((entry) => ({
			id: entry.slug,
			title: entry.title,
			iconName: entry.icon,
			iconContainerClass: iconStyleForProduct(entry.slug).containerClass,
			iconClass: iconStyleForProduct(entry.slug).iconClass,
			href: entry.href,
			description: entry.description,
			priceRangeLabel: entry.priceRangeLabel,
			platformSupportLabel: entry.platformSupportLabel,
			ctaLabel: 'Open'
		}));
	}
</script>

<section class="py-10 md:py-14" aria-labelledby={headingId}>
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<div class="flex justify-center">
			<PublicAlternativesLandingBreadcrumb variant="hub" />
		</div>
		<h1 id={headingId} class={`flex flex-col items-center ${alternativesHubHeroTitleClass}`}>
			<span class={PUBLIC_SOCIAL_AUTOPILOT_HERO_TITLE_LINE_CLASS}>
				<span class="inline-block shrink-0 text-base-content">{hubVm.heroTitlePrefix}</span>
				<span class={heroHighlightGradientClass}>{hubVm.heroHighlightText}</span>
			</span>
		</h1>
		<p class="mx-auto max-w-2xl text-base text-base-content/70">
			{hubVm.description}
		</p>
	</header>

	<div class="container mx-auto max-w-5xl space-y-3 px-4 pt-8">
		<PublicHubSearchBar
			class="[&_input]:border-primary/20"
			bind:value={searchDraft}
			placeholder="Search alternatives…"
			onchange={() => applySearch()}
		/>
		<PublicAlternativesHubToolbar
			{filtersVm}
			onCategoryChange={(category: AlternativesHubCategory) => onFiltersChange({ category })}
			onSortChange={(sort: AlternativesHubSort) => onFiltersChange({ sort })}
		/>
	</div>

	{#if showSocialSection}
	<div class="mt-12">
		<PublicAlternativesHubSectionHeading section={hubVm.socialSection} />

		<SimpleCardGrid
			heroTheme={cardGridHeroTheme}
			headingId="public-alternatives-social-grid-heading"
			title=""
			items={entryCardItems(hubVm.socialSection)}
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

		{#if hubVm.socialSection.entries.length === 0}
			<p class="mx-auto max-w-5xl px-4 pt-8 text-center text-base text-base-content/60">
				No scheduler alternatives matched your search.
			</p>
		{/if}

		<p class="mx-auto mt-8 max-w-5xl text-center">
			<InternalLink
				href={hubVm.socialSection.learnMoreHref}
				class="text-sm font-semibold text-primary hover:underline"
			>
				{hubVm.socialSection.learnMoreLabel}
			</InternalLink>
		</p>
	</div>
	{/if}

	{#if showDirectorySection}
	<div
		class={[
			'mt-12 pt-10 md:mt-14 md:pt-14',
			showSocialSection ? 'border-t border-base-content/10' : ''
		]}
	>
		<PublicAlternativesHubSectionHeading section={hubVm.directorySection} />

		<SimpleCardGrid
			heroTheme={cardGridHeroTheme}
			headingId="public-alternatives-directory-grid-heading"
			title=""
			items={entryCardItems(hubVm.directorySection)}
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

		{#if hubVm.directorySection.entries.length === 0}
			<p class="mx-auto max-w-5xl px-4 pt-8 text-center text-base text-base-content/60">
				No directory alternatives matched your search.
			</p>
		{/if}

		<p class="mx-auto mt-8 max-w-5xl text-center">
			<InternalLink
				href={hubVm.directorySection.learnMoreHref}
				class="text-sm font-semibold text-primary hover:underline"
			>
				{hubVm.directorySection.learnMoreLabel}
			</InternalLink>
		</p>
	</div>
	{/if}
</section>
