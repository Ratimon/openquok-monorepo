<script lang="ts">
	import type { IconName } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';

	import { GridCardBackground, HexagonCardBackground, StripedCardBackground } from '$lib/ui/patterns/index.js';
	import type { StripedCardTone } from '$lib/ui/patterns/StripedCardBackground.svelte';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	export type FeatureSimpleCardItem = {
		id: string;
		title: string;
		description: string;
		icon: IconName;
		iconClass?: string;
		iconWidth?: string;
		iconHeight?: string;
		containerClass?: string;
	};

	type CardBackgroundVariant = 'grid' | 'hexagon' | 'striped';

	type PatternCell = [col: number, row: number];

	type Props = {
		item: FeatureSimpleCardItem;
		pattern?: PatternCell[];
		backgroundVariant?: CardBackgroundVariant;
		stripedDirection?: 'left' | 'right';
		stripedTone?: StripedCardTone;
		compact?: boolean;
		href?: string;
		onActivate?: () => void;
	};

	let {
		item,
		pattern,
		backgroundVariant = 'grid',
		stripedDirection = 'left',
		stripedTone = 'emerald',
		compact = false,
		href,
		onActivate
	}: Props = $props();

	const cardClass = $derived(
		cn(
			'relative block overflow-hidden rounded-3xl p-6',
			backgroundVariant === 'striped'
				? stripedTone === 'amber'
					? 'border border-amber-500/25 bg-gradient-to-b from-amber-500/12 via-base-100 to-base-100 shadow-sm transition duration-300 hover:border-amber-400/45 hover:shadow-md'
					: 'border border-emerald-500/25 bg-gradient-to-b from-emerald-500/12 via-base-100 to-base-100 shadow-sm transition duration-300 hover:border-emerald-400/45 hover:shadow-md'
				: 'border border-base-content/5 bg-gradient-to-b from-base-200/80 to-base-100 shadow-sm transition duration-300 hover:border-primary/20 hover:shadow-md',
			compact && 'p-5'
		)
	);

	const iconContainerClass = $derived(
		item.containerClass ??
			(backgroundVariant === 'striped'
				? stripedTone === 'amber'
					? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
					: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
				: 'bg-primary/10 text-primary')
	);
</script>

{#snippet cardBody()}
	{#if backgroundVariant === 'hexagon'}
		<HexagonCardBackground hexagons={pattern} />
	{:else if backgroundVariant === 'striped'}
		<StripedCardBackground direction={stripedDirection} tone={stripedTone} />
	{:else}
		<GridCardBackground {pattern} />
	{/if}
	<div class="relative z-20 flex flex-col gap-3">
		<span
			class={cn(
				'grid size-11 place-items-center rounded-xl',
				iconContainerClass
			)}
		>
			<AbstractIcon
				name={item.icon}
				width={item.iconWidth ?? '24'}
				height={item.iconHeight ?? '24'}
				class={item.iconClass ?? 'size-6'}
				focusable="false"
			/>
		</span>
		<h3 class="text-base font-bold text-base-content">{item.title}</h3>
		<p class="text-sm font-medium leading-relaxed text-pretty text-base-content/70">
			{item.description}
		</p>
	</div>
{/snippet}

{#if onActivate}
	<button
		type="button"
		class={cn(cardClass, 'w-full cursor-pointer text-left')}
		onclick={onActivate}
	>
		{@render cardBody()}
	</button>
{:else if href}
	<a {href} class={cardClass}>
		{@render cardBody()}
	</a>
{:else}
	<article class={cardClass}>
		{@render cardBody()}
	</article>
{/if}
