<script lang="ts">
	import type { IconName } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';

	import FeatureSimpleCardBackground from '$lib/ui/templates/feature-grid/FeatureSimpleCardBackground.svelte';
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

	type Props = {
		item: FeatureSimpleCardItem;
		pattern?: number[][];
		compact?: boolean;
	};

	let { item, pattern, compact = false }: Props = $props();
</script>

<article
	class={cn(
		'relative overflow-hidden rounded-3xl bg-gradient-to-b from-base-200/80 to-base-100 p-6',
		'border border-base-content/5 shadow-sm transition duration-300 hover:border-primary/20 hover:shadow-md',
		compact && 'p-5'
	)}
>
	<FeatureSimpleCardBackground {pattern} />
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
</article>
