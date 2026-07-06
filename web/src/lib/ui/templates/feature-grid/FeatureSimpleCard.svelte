<script lang="ts">
	import type { IconName } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';

	import { GridCardBackground, HexagonCardBackground } from '$lib/ui/patterns/index.js';

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

	type CardBackgroundVariant = 'grid' | 'hexagon';

	type PatternCell = [col: number, row: number];

	type Props = {
		item: FeatureSimpleCardItem;
		pattern?: PatternCell[];
		backgroundVariant?: CardBackgroundVariant;
		compact?: boolean;
		href?: string;
		onActivate?: () => void;
	};

	let { item, pattern, backgroundVariant = 'grid', compact = false, href, onActivate }: Props =
		$props();

	const cardClass = $derived(
		cn(
			'relative block overflow-hidden rounded-3xl bg-gradient-to-b from-base-200/80 to-base-100 p-6',
			'border border-base-content/5 shadow-sm transition duration-300 hover:border-primary/20 hover:shadow-md',
			compact && 'p-5'
		)
	);
</script>

{#snippet cardBody()}
	{#if backgroundVariant === 'hexagon'}
		<HexagonCardBackground hexagons={pattern} />
	{:else}
		<GridCardBackground {pattern} />
	{/if}
	<div class="relative z-20 flex flex-col gap-3">
		<span
			class={cn(
				'grid size-11 place-items-center rounded-xl',
				item.containerClass ?? 'bg-primary/10 text-primary'
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
