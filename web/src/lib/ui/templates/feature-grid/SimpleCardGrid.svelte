<script lang="ts">
	import type { FeatureSimpleCardItem } from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';

	import FeatureSimpleCard from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';

	type LandingHeroTheme = {
		subtitleClass?: string;
		parseLandingHeroTitlePartSegments: (text: string) => { text: string; highlight: boolean }[];
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		headingId: string;
		title: string;
		description?: string;
		subtitle?: string;
		items: FeatureSimpleCardItem[];
		extensionLabel?: string;
		extensionItems?: FeatureSimpleCardItem[];
		sectionClass?: string;
	};

	let {
		heroTheme,
		headingId,
		title,
		description = '',
		subtitle = '',
		items,
		extensionLabel = '',
		extensionItems = [],
		sectionClass = 'py-16 sm:py-20'
	}: Props = $props();

	const CARD_PATTERNS: number[][][] = [
		[
			[7, 1],
			[8, 3],
			[9, 5]
		],
		[
			[6, 2],
			[8, 4],
			[10, 1]
		],
		[
			[7, 4],
			[9, 2],
			[11, 5]
		],
		[
			[8, 1],
			[10, 3],
			[12, 2]
		],
		[
			[6, 5],
			[9, 1],
			[11, 4]
		],
		[
			[7, 2],
			[8, 5],
			[10, 3]
		]
	];

	function patternForIndex(index: number): number[][] {
		return CARD_PATTERNS[index % CARD_PATTERNS.length];
	}
</script>

<section class="relative isolate overflow-hidden bg-base-100 {sectionClass}" aria-labelledby={headingId}>
	<div class="container mx-auto px-4">
		<FeaturesSectionHeader {heroTheme} {headingId} {title} {description} {subtitle} />

		<div
			class="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3"
			aria-label={title}
		>
			{#each items as item, index (item.id)}
				<FeatureSimpleCard {item} pattern={patternForIndex(index)} />
			{/each}
		</div>

		{#if extensionItems.length > 0}
			<div class="mx-auto mt-12 max-w-7xl space-y-5 sm:mt-14">
				{#if extensionLabel}
					<p class="text-center text-sm font-bold tracking-wide text-base-content/60 uppercase">
						{extensionLabel}
					</p>
				{/if}
				<div
					class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
					aria-label={extensionLabel || 'Extension channels'}
				>
					{#each extensionItems as item, index (item.id)}
						<FeatureSimpleCard
							{item}
							compact
							pattern={patternForIndex(items.length + index)}
						/>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>
