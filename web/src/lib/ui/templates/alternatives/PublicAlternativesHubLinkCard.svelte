<script lang="ts">
	import type { CardPatternCell, CardPatternComponent } from '$lib/ui/patterns';
	import type { IconName } from '$data/icons';

	import { CardPatternLayer } from '$lib/ui/patterns';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PatternedCardShell from '$lib/ui/templates/feature-grid/PatternedCardShell.svelte';

	export type PublicAlternativesHubLinkCardItem = {
		id: string;
		title: string;
		iconName: IconName;
		iconContainerClass: string;
		iconClass?: string;
		href: string;
		description: string;
		priceRangeLabel: string;
		platformSupportLabel: string;
		ctaLabel?: string;
	};

	type Props = {
		item: PublicAlternativesHubLinkCardItem;
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

	<div class="relative z-20 flex h-full flex-col gap-3">
		<div class="flex items-start justify-between gap-3">
			<h2 class="min-w-0 flex-1 text-balance text-xl font-semibold leading-snug text-base-content">
				{item.title}
			</h2>
			<div
				class={`flex size-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ${item.iconContainerClass}`}
			>
				<AbstractIcon
					name={item.iconName}
					width="20"
					height="20"
					class={item.iconClass ?? 'size-5'}
					focusable="false"
				/>
			</div>
		</div>
		<p class="text-sm font-medium leading-relaxed text-base-content/65">
			{item.description}
		</p>
		<div class="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-primary/15 pt-4">
			<dl
				class="min-w-0 flex-1 space-y-2.5 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5 ring-1 ring-primary/10"
			>
				<div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
					<dt class="text-xs font-bold tracking-wider text-primary uppercase">Price</dt>
					<dd class="text-sm font-semibold tabular-nums text-primary">
						{item.priceRangeLabel}
					</dd>
				</div>
				<div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
					<dt class="text-xs font-bold tracking-wider text-secondary uppercase">Platforms</dt>
					<dd class="text-sm font-semibold text-secondary">
						{item.platformSupportLabel}
					</dd>
				</div>
			</dl>
			<span class="shrink-0 text-sm font-semibold text-primary" aria-hidden="true">
				{item.ctaLabel ?? 'Open'}
			</span>
		</div>
	</div>
</PatternedCardShell>
