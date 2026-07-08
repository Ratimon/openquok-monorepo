<script lang="ts">
	import type { CardPatternCell, CardPatternComponent } from '$lib/ui/patterns/types';

	import { cn } from '$lib/ui/helpers/common';

	import { GridCardBackground, HexagonCardBackground, StripedCardBackground } from '$lib/ui/patterns/index.js';
	import type { StripedCardTone } from '$lib/ui/patterns/StripedCardBackground.svelte';

	type CardBackgroundVariant = 'grid' | 'hexagon' | 'striped';

	type Props = {
		pattern?: CardPatternCell[];
		patternComponent?: CardPatternComponent;
		patternClass?: string;
		backgroundVariant?: CardBackgroundVariant;
		stripedDirection?: 'left' | 'right';
		stripedTone?: StripedCardTone;
	};

	let {
		pattern,
		patternComponent: PatternComponent,
		patternClass,
		backgroundVariant = 'grid',
		stripedDirection = 'left',
		stripedTone = 'emerald'
	}: Props = $props();
</script>

{#if PatternComponent}
	<PatternComponent
		{pattern}
		class={cn('pointer-events-none absolute inset-0 z-10 h-full w-full', patternClass)}
	/>
{:else if backgroundVariant === 'hexagon'}
	<HexagonCardBackground hexagons={pattern} />
{:else if backgroundVariant === 'striped'}
	<StripedCardBackground direction={stripedDirection} tone={stripedTone} />
{:else}
	<GridCardBackground {pattern} />
{/if}
