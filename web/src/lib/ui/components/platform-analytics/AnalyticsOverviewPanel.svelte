<script lang="ts">
	import {
		ANALYTICS_METRIC_FAMILIES,
		ANALYTICS_METRIC_FAMILY_LABELS,
		buildAnalyticsOverviewChartVm,
		buildAnalyticsOverviewSummaryVm,
		type AnalyticsMetricFamily,
		type AnalyticsSeriesViewModel
	} from '$lib/platform-analytics/GetAnalytics.presenter.svelte';

	import AnalyticsOverviewLineChart from '$lib/ui/components/platform-analytics/AnalyticsOverviewLineChart.svelte';

	type Props = {
		seriesVm: AnalyticsSeriesViewModel[];
	};

	let { seriesVm }: Props = $props();

	let selectedFamily = $state<AnalyticsMetricFamily>('views');

	const summaryVm = $derived(buildAnalyticsOverviewSummaryVm(seriesVm));
	const chartVm = $derived(buildAnalyticsOverviewChartVm(seriesVm, selectedFamily));

	const hasAnySummary = $derived(summaryVm.some((row) => row.channelCount > 0));
</script>

{#if hasAnySummary}
	<section
		class="space-y-4 rounded-xl border border-base-300 bg-base-100/60 p-4 shadow-sm sm:p-5"
		aria-labelledby="analytics-overview-trends-heading"
	>
		<div class="space-y-1">
			<h4 id="analytics-overview-trends-heading" class="text-base font-semibold text-base-content">
				Trends
			</h4>
			<p class="text-xs text-base-content/60">
				Compare channels using each network's closest matching metric. Totals add primary series per
				channel — not a single blended platform metric.
			</p>
		</div>

		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			{#each summaryVm as row (row.family)}
				<div class="rounded-lg border border-base-300/80 bg-base-100 px-4 py-3">
					<p class="text-base font-semibold text-base-content">
						{row.label}
						{#if row.mixedSourceLabels && row.channelCount > 1}
							<span class="text-sm font-medium text-base-content/50"> · mixed labels</span>
						{/if}
					</p>
					<p class="mt-1 text-2xl font-semibold tracking-tight text-base-content">
						{row.formattedTotal}
					</p>
					{#if row.channelCount > 0}
						<p class="mt-0.5 text-xs text-base-content/55">
							{row.channelCount} channel{row.channelCount === 1 ? '' : 's'}
						</p>
					{/if}
				</div>
			{/each}
		</div>

		<div class="space-y-3">
			<div class="flex flex-wrap gap-2" role="tablist" aria-label="Chart metric family">
				{#each ANALYTICS_METRIC_FAMILIES as family (family)}
					<button
						type="button"
						role="tab"
						class="rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors {selectedFamily === family
							? 'border-primary bg-primary/10 text-primary'
							: 'border-base-300 text-base-content/70 hover:border-base-content/30'}"
						aria-selected={selectedFamily === family}
						onclick={() => {
							selectedFamily = family;
						}}
					>
						{ANALYTICS_METRIC_FAMILY_LABELS[family]}
					</button>
				{/each}
			</div>

			<AnalyticsOverviewLineChart dates={chartVm.dates} lines={chartVm.lines} />
		</div>
	</section>
{/if}
