<script lang="ts">
	import type { CardPatternCell, CardPatternComponent } from '$lib/ui/patterns';
	import type { IconName } from '$data/icons';

	import { CardPatternLayer } from '$lib/ui/patterns';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PatternedCardShell from '$lib/ui/templates/feature-grid/PatternedCardShell.svelte';

	export type SimpleLinkCardItem = {
		id: string;
		title: string;
		iconName?: IconName;
		iconContainerClass?: string;
		iconClass?: string;
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
			<div class="flex items-center gap-3">
				<h2 class="flex items-center gap-3 text-xl font-semibold text-base-content">
					<span>{item.title}</span>
					{#if item.iconName}
						<div
							class={`flex size-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ${
								item.iconContainerClass ??
								'bg-base-100/90 text-base-content ring-base-content/10'
							}`}
						>
							<AbstractIcon
								name={item.iconName}
								width="20"
								height="20"
								class={item.iconClass ?? 'size-5'}
								focusable="false"
							/>
						</div>
					{/if}
				</h2>
			</div>
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
