<script lang="ts">
	import type { CardPatternCell, CardPatternComponent } from '$lib/ui/patterns';
	import type { IconName } from '$data/icons';

	import { CardPatternLayer } from '$lib/ui/patterns';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PatternedCardShell from '$lib/ui/templates/feature-grid/PatternedCardShell.svelte';
	import PublicSoonBadge from '$lib/ui/components/PublicSoonBadge.svelte';

	export type SimpleLinkCardItem = {
		id: string;
		title: string;
		iconName?: IconName;
		iconContainerClass?: string;
		iconClass?: string;
		href: string;
		description?: string;
		ctaLabel?: string;
		badgeLabel?: string;
		/** Optional hub metrics row (alternatives directory cards). */
		priceRangeLabel?: string;
		platformSupportLabel?: string;
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

	<div class="relative z-20 flex h-full flex-col gap-3">
		<div class="flex items-start justify-between gap-3">
			<h2 class="min-w-0 flex-1 text-balance text-xl font-semibold leading-snug text-base-content">
				{item.title}
			</h2>
			<div class="flex shrink-0 items-start gap-2">
				{#if item.badgeLabel}
					<PublicSoonBadge label={item.badgeLabel} />
				{/if}
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
			</div>
		</div>
		{#if item.description}
			<p class="text-sm font-medium leading-relaxed text-base-content/65">
				{item.description}
			</p>
		{/if}
		<div
			class={[
				'mt-auto flex flex-wrap items-end justify-between gap-3',
				item.priceRangeLabel || item.platformSupportLabel
					? 'border-t border-primary/15 pt-4'
					: 'pt-3'
			].join(' ')}
		>
			{#if item.priceRangeLabel || item.platformSupportLabel}
				<dl
					class="min-w-0 flex-1 space-y-2.5 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5 ring-1 ring-primary/10"
				>
					{#if item.priceRangeLabel}
						<div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
							<dt class="text-xs font-bold tracking-wider text-primary uppercase">Price</dt>
							<dd class="text-sm font-semibold tabular-nums text-primary">
								{item.priceRangeLabel}
							</dd>
						</div>
					{/if}
					{#if item.platformSupportLabel}
						<div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
							<dt class="text-xs font-bold tracking-wider text-secondary uppercase">
								Platforms
							</dt>
							<dd class="text-sm font-semibold text-secondary">
								{item.platformSupportLabel}
							</dd>
						</div>
					{/if}
				</dl>
			{/if}
			<span
				class={[
					'shrink-0 text-sm font-semibold text-primary',
					item.priceRangeLabel || item.platformSupportLabel ? '' : 'ms-auto'
				].join(' ')}
				aria-hidden="true"
			>
				{item.ctaLabel ?? 'Explore'}
			</span>
		</div>
	</div>
</PatternedCardShell>
