<script lang="ts">
	import AnalyticsSparkline from './AnalyticsSparkline.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { icons } from '$data/icons';
	import type { AnalyticsSeriesVm } from '$lib/platform-analytics/GetAnalytics.presenter.svelte';

	type Props = {
		item: AnalyticsSeriesVm;
		total: string | number;
		index: number;
	};

	let { item, total, index }: Props = $props();

	// const colorVariants = ['text-purple-400', 'text-emerald-400', 'text-sky-400'] as const;
	const strokeVariants = ['stroke-purple-400', 'stroke-emerald-400', 'stroke-sky-400'] as const;
	const dotBgVariants = ['bg-purple-400', 'bg-emerald-400', 'bg-sky-400'] as const;

	const dotBg = $derived(dotBgVariants[index % dotBgVariants.length]);
	const lineColor = $derived(strokeVariants[index % strokeVariants.length]);
	const trendUp = $derived((item.percentageChange ?? 0) > 0);
	const trendDown = $derived((item.percentageChange ?? 0) < 0);

	const showTrend = $derived(item.percentageChange !== undefined && (item.percentageChange ?? 0) !== 0);
	const trendText = $derived.by(() => {
		const v = item.percentageChange ?? 0;
		if (!Number.isFinite(v) || v === 0) return '';
		const display = Math.abs(v).toFixed(1);
		return `${display}${item.average ? 'pp' : '%'}`;
	});

	const hasMultipleDataPoints = $derived((item.data?.length ?? 0) > 1);
</script>

<div class="group relative">
	<div
		class={cn(
			'flex h-full flex-col rounded-xl border border-base-300 bg-base-100/60 shadow-sm transition-all duration-200 hover:border-primary/40',
			'overflow-hidden'
		)}
	>
		<div class="flex items-center justify-between px-4 pt-4 pb-2">
			<div class="flex items-center gap-2">
				<span class={cn('h-2 w-2 rounded-full', dotBg)} aria-hidden="true"></span>
				<span class="text-sm font-medium text-base-content/90">{item.label}</span>
			</div>
			{#if showTrend}
				<div
					class={cn(
						'flex items-center gap-1 text-xs font-semibold',
						trendUp ? 'text-emerald-400' : '',
						trendDown ? 'text-red-400' : ''
					)}
				>
					<AbstractIcon
						name={icons.ChevronUp.name}
						class={cn('size-3', trendDown ? 'rotate-180' : '')}
						width="12"
						height="12"
					/>
					<span>{trendText}</span>
				</div>
			{/if}
		</div>

		{#if hasMultipleDataPoints}
			<div class="px-3 py-2">
				<div class="h-28 w-full">
					<AnalyticsSparkline
						data={item.data}
						class="h-full w-full"
						colorClass={lineColor}
					/>
				</div>
			</div>

			<div class="px-4 pb-4">
				<div class="text-4xl font-semibold tracking-tight text-base-content">{total}</div>
			</div>
		{:else}
			<div class="flex flex-1 items-center justify-center px-4 py-8">
				<div class="text-5xl font-semibold tracking-tight text-base-content">{total}</div>
			</div>
		{/if}
	</div>
</div>
