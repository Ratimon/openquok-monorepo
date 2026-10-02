<script lang="ts">
	import type { BuildBacklinksHubStatsViewModel } from '$lib/link-directory/utils/buildBuildBacklinksHubStats';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		statsVm: BuildBacklinksHubStatsViewModel;
		class?: string;
	};

	let { statsVm, class: className = '' }: Props = $props();

	const items = $derived([
		{ label: 'Opportunities', value: statsVm.opportunities, valueClass: 'text-emerald-400' },
		{ label: 'Free or freemium', value: statsVm.freeOrFreemium, valueClass: 'text-sky-400' },
		{ label: 'Quick wins', value: statsVm.quickWins, valueClass: 'text-violet-400' },
		{ label: 'Categories', value: statsVm.categories, valueClass: 'text-amber-300' }
	]);
</script>

<div
	class={cn('flex flex-wrap items-start justify-center gap-x-10 gap-y-4 sm:gap-x-12', className)}
	aria-label="Backlink directory totals"
>
	{#each items as item (item.label)}
		<div class="flex flex-col items-center gap-1">
			<span class={cn('text-3xl font-bold tabular-nums tracking-tight sm:text-4xl', item.valueClass)}>
				{item.value.toLocaleString()}
			</span>
			<span class="text-[0.65rem] font-semibold tracking-[0.18em] text-base-content/45 uppercase sm:text-xs">
				{item.label}
			</span>
		</div>
	{/each}
</div>
