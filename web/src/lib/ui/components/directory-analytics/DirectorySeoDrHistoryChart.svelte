<script lang="ts">
	import type { DirectorySeoHistoryChartSeriesViewModel } from '$lib/directory-seo/buildDirectorySeoHistoryChartSeries';
	import { buildDirectorySeoLineChartRows } from '$lib/directory-seo/buildDirectorySeoLineChartRows';
	import { computeDomainRatingChartYDomain } from '$lib/directory-seo/computeDomainRatingChartYDomain';

	import { scaleUtc } from 'd3-scale';
	import { curveMonotoneX } from 'd3-shape';
	import { LineChart } from 'layerchart';

	import { directorySeoChartColorAt } from '$lib/directory-seo/directorySeoChartColors';

	import * as Chart from '$lib/ui/chart';

	type Props = {
		series: DirectorySeoHistoryChartSeriesViewModel[];
	};

	let { series }: Props = $props();

	const chartConfig = $derived.by(() => {
		const config: Chart.ChartConfig = {};
		for (const line of series) {
			config[line.key] = { label: line.label, color: line.color };
		}
		return config;
	});

	const chartData = $derived.by(() => buildDirectorySeoLineChartRows(series));

	const chartSeries = $derived(
		series.map((line, index) => ({
			key: line.key,
			label: line.label,
			color: line.color || directorySeoChartColorAt(index)
		}))
	);

	const yDomain = $derived.by((): [number, number] => {
		const values: number[] = [];
		for (const row of chartData) {
			for (const line of series) {
				const value = row[line.key];
				if (typeof value === 'number' && Number.isFinite(value)) {
					values.push(value);
				}
			}
		}
		return computeDomainRatingChartYDomain(values);
	});

	const hasPlottedPoints = $derived(chartData.length > 0);

	function formatAxisDate(value: Date): string {
		return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}
</script>

{#if !hasPlottedPoints}
	<p class="py-8 text-center text-sm text-base-content/60">No domain rating history yet.</p>
{:else}
	<div class="space-y-3">
		<Chart.Container config={chartConfig} class="aspect-auto h-52 w-full min-h-[12rem]">
			<LineChart
				data={chartData}
				x="date"
				xScale={scaleUtc()}
				{yDomain}
				axis={true}
				grid
				series={chartSeries}
				props={{
					spline: { curve: curveMonotoneX, motion: 'tween', strokeWidth: 2 },
					xAxis: {
						format: (value: Date) => formatAxisDate(value)
					},
					yAxis: {
						format: (value: number) => String(Math.round(value))
					},
					highlight: { points: { r: chartData.length <= 3 ? 5 : 4 } }
				}}
			>
				{#snippet tooltip()}
					<Chart.Tooltip labelFormatter={(value) => formatAxisDate(value as Date)} />
				{/snippet}
			</LineChart>
		</Chart.Container>

		<ul class="flex list-none flex-wrap gap-x-4 gap-y-2 p-0 text-xs text-base-content/80">
			{#each series as line (line.key)}
				<li class="flex min-w-0 max-w-full items-center gap-1.5">
					<span
						class="h-2 w-2 shrink-0 rounded-full"
						style:background-color={line.color}
						aria-hidden="true"
					></span>
					<span class="truncate font-medium" title={line.label}>{line.label}</span>
				</li>
			{/each}
		</ul>
	</div>
{/if}
