<script lang="ts">
	import type { CardPatternCell, CardPatternComponent } from '$lib/ui/patterns';
	import PatternedCardShell from '$lib/ui/templates/feature-grid/PatternedCardShell.svelte';
	import { CardPatternLayer } from '$lib/ui/patterns';

	export type SimpleLinkCardItem = {
		id: string;
		title: string;
		href: string;
		description?: string;
		ctaLabel?: string;
	};

	type Props = {
		item: SimpleLinkCardItem;
		pattern?: CardPatternCell[];
		patternComponent?: CardPatternComponent;
		patternClass?: string;
	};

	let {
		item,
		pattern,
		patternComponent: PatternComponent,
		patternClass
	}: Props = $props();
</script>

<PatternedCardShell
	href={item.href}
	class="relative block overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 p-6 shadow-sm transition duration-300 hover:border-primary/35 hover:shadow-md"
>
	<CardPatternLayer
		{pattern}
		patternComponent={PatternComponent}
		patternClass={patternClass ?? 'text-primary/10 stroke-[0.75]'}
	/>

	<div class="relative z-20 flex h-full items-center justify-between gap-4">
		<div class="space-y-2">
			<h2 class="text-xl font-semibold text-base-content">{item.title}</h2>
			{#if item.description}
				<p class="text-sm font-medium leading-relaxed text-base-content/65">
					{item.description}
				</p>
			{/if}
		</div>
		<span class="shrink-0 text-sm font-medium text-primary" aria-hidden="true">
			{item.ctaLabel ?? 'Explore'}
		</span>
	</div>
</PatternedCardShell>
