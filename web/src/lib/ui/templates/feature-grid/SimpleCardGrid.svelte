<script lang="ts" generics="Item">
	import type { Snippet } from 'svelte';
	import type { CardPatternCell, CardPatternComponent } from '$lib/ui/patterns';
	import { cardPatternAtIndex } from '$lib/ui/patterns';

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
		items: Item[];
		getItemKey: (item: Item, index: number) => string;
		card: Snippet<
			[
				item: Item,
				context: {
					index: number;
					pattern: CardPatternCell[];
					patternComponent?: CardPatternComponent;
					patternClass?: string;
				}
			]
		>;
		extensionLabel?: string;
		extensionItems?: Item[];
		sectionClass?: string;
		patternComponent?: CardPatternComponent;
		patternClass?: string;
	};

	let {
		heroTheme,
		headingId,
		title,
		description = '',
		subtitle = '',
		items,
		getItemKey,
		card,
		extensionLabel = '',
		extensionItems = [],
		sectionClass = 'py-16 sm:py-20',
		patternComponent,
		patternClass
	}: Props = $props();
</script>

<section class="relative isolate overflow-hidden bg-base-100 {sectionClass}" aria-labelledby={headingId}>
	<div class="container mx-auto px-4">
		{#if title || description || subtitle}
			<FeaturesSectionHeader {heroTheme} {headingId} {title} {description} {subtitle} />
		{/if}

		<div
			class={title || description || subtitle
				? 'mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3'
				: 'mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}
			aria-label={title || headingId}
		>
			{#each items as item, index (getItemKey(item, index))}
				{@render card(item, {
					index,
					pattern: cardPatternAtIndex(index),
					patternComponent,
					patternClass
				})}
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
					{#each extensionItems as item, index (getItemKey(item, items.length + index))}
						{@render card(item, {
							index: items.length + index,
							pattern: cardPatternAtIndex(items.length + index),
							patternComponent,
							patternClass
						})}
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>
