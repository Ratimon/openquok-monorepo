<script lang="ts">
	import type { ExtensionsHubStatsViewModel } from '$lib/listings/index';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		statsVm: ExtensionsHubStatsViewModel;
		class?: string;
	};

	let { statsVm, class: className = '' }: Props = $props();

	const items = $derived([
		{ label: 'Official', value: statsVm.official, valueClass: 'text-emerald-400' },
		{ label: 'Community', value: statsVm.community, valueClass: 'text-sky-400' },
		{ label: 'Categories', value: statsVm.categories, valueClass: 'text-violet-400' }
	]);
</script>

<div
	class={cn('flex flex-wrap items-start justify-center gap-x-10 gap-y-4 sm:gap-x-14', className)}
	aria-label="Extension counts"
>
	{#each items as item (item.label)}
		<div class="flex flex-col items-center gap-1">
			<span class={cn('text-3xl font-bold tabular-nums tracking-tight sm:text-4xl', item.valueClass)}>
				{item.value.toLocaleString()}
			</span>
			<span class="text-[0.65rem] font-semibold tracking-[0.2em] text-base-content/45 uppercase sm:text-xs">
				{item.label}
			</span>
		</div>
	{/each}
</div>
