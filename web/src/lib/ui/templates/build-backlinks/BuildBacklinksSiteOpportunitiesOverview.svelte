<script lang="ts">
	import type { BuildBacklinksGuideOverviewCardVm } from '$lib/link-directory/utils/buildBuildBacklinksGuideSections';
	import { cardPatternAtIndex } from '$lib/ui/patterns';

	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import FeatureSimpleCard from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';
	import type { FeatureSimpleCardItem } from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';

	type LandingHeroTheme = {
		subtitleClass?: string;
		parseLandingHeroTitlePartSegments: (text: string) => { text: string; highlight: boolean }[];
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		sectionId: string;
		subtitle?: string;
		sectionTitle: string;
		sectionDescription?: string;
		cards: BuildBacklinksGuideOverviewCardVm[];
		sectionClass?: string;
	};

	let {
		heroTheme,
		sectionId,
		subtitle = '',
		sectionTitle,
		sectionDescription = '',
		cards,
		sectionClass = 'bg-base-200 py-16 sm:py-20'
	}: Props = $props();

	const headingId = $derived(`${sectionId}-heading`);

	function toFeatureCardItem(card: BuildBacklinksGuideOverviewCardVm): FeatureSimpleCardItem {
		return {
			id: card.slug,
			eyebrow: card.eyebrow,
			title: card.title,
			description: card.description,
			icon: card.icon
		};
	}
</script>

{#if cards.length > 0}
	<section
		id={sectionId}
		class="relative isolate scroll-mt-28 overflow-hidden {sectionClass}"
		aria-labelledby={headingId}
	>
		<div class="container mx-auto px-4">
			<FeaturesSectionHeader
				{heroTheme}
				{headingId}
				title={sectionTitle}
				description={sectionDescription}
				{subtitle}
			/>

			<div
				class="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3"
				aria-label={sectionTitle}
			>
				{#each cards as card, index (card.slug)}
					<FeatureSimpleCard
						item={toFeatureCardItem(card)}
						href={`#${card.anchorId}`}
						pattern={cardPatternAtIndex(index)}
						backgroundVariant="hexagon"
					/>
				{/each}
			</div>
		</div>
	</section>
{/if}
