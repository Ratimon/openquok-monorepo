<script lang="ts">
	import {
		alignChartLineValues,
		type AnalyticsOverviewChartLineVm
	} from '$lib/platform-analytics/GetAnalytics.presenter.svelte';

	import { socialProviderDisplayLabel, socialProviderIcon } from '$data/social-providers';

	import { scaleUtc } from 'd3-scale';
	import { curveMonotoneX } from 'd3-shape';
	import { LineChart } from 'layerchart';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Chart from '$lib/ui/chart';

	type Props = {
		dates: string[];
		lines: AnalyticsOverviewChartLineVm[];
	};

	let { dates, lines }: Props = $props();

	const chartColorVars = [
		'var(--chart-1)',
		'var(--chart-2)',
		'var(--chart-3)',
		'var(--chart-4)',
		'var(--chart-5)'
	] as const;

	const chartConfig = $derived.by(() => {
		const config: Chart.ChartConfig = {};
		for (const line of lines) {
			config[line.integrationId] = {
				label: line.channelName || socialProviderDisplayLabel(line.providerIdentifier),
				color: chartColorVars[line.colorIndex % chartColorVars.length]
			};
		}
		return config;
	});

	const chartData = $derived.by(() => {
		if (dates.length === 0 || lines.length === 0) return [];
		return dates.map((dateStr, index) => {
			const row: Record<string, Date | number> = {
				date: parseOverviewChartDate(dateStr)
			};
			for (const line of lines) {
				row[line.integrationId] = alignChartLineValues(line, dates)[index] ?? 0;
			}
			return row;
		});
	});

	const chartSeries = $derived(
		lines.map((line) => ({
			key: line.integrationId,
			label: chartConfig[line.integrationId]?.label ?? line.channelName,
			color: chartConfig[line.integrationId]?.color ?? chartColorVars[0]
		}))
	);

	const yDomain = $derived.by((): [number, number] => {
		if (dates.length === 0 || lines.length === 0) return [0, 1];
		const allValues = lines.flatMap((line) => alignChartLineValues(line, dates));
		const maxY = Math.max(...allValues, 0);
		const minY = Math.min(...allValues, 0);
		if (maxY <= minY) return [0, Math.max(1, maxY)];
		return [minY, maxY];
	});

	function parseOverviewChartDate(dateStr: string): Date {
		const trimmed = dateStr.trim();
		if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
			const [year, month, day] = trimmed.split('-').map((part) => Number(part));
			return new Date(year, month - 1, day);
		}
		const parsed = Date.parse(trimmed);
		return Number.isFinite(parsed) ? new Date(parsed) : new Date();
	}

	function formatAxisDate(value: Date): string {
		return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}

	function formatAxisValue(value: number): string {
		return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value);
	}

	function seriesColor(line: AnalyticsOverviewChartLineVm): string {
		return chartColorVars[line.colorIndex % chartColorVars.length];
	}
</script>

{#if lines.length === 0}
	<p class="py-8 text-center text-sm text-base-content/60">
		No daily series match this metric family for the selected channels.
	</p>
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
						format: (value: number) => formatAxisValue(value)
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
			{#each lines as line (line.integrationId)}
				<li class="flex min-w-0 max-w-full items-center gap-1.5">
					<span
						class="h-2 w-2 shrink-0 rounded-full"
						style:background-color={seriesColor(line)}
						aria-hidden="true"
					></span>
					{#if line.providerIdentifier}
						<AbstractIcon
							name={socialProviderIcon(line.providerIdentifier)}
							class="size-3 shrink-0"
							width="12"
							height="12"
							aria-hidden="true"
						/>
					{/if}
					<span class="truncate font-medium" title={line.channelName}>
						{line.channelName || socialProviderDisplayLabel(line.providerIdentifier)}
					</span>
					<span class="shrink-0 text-base-content/50">({line.sourceMetricLabel})</span>
				</li>
			{/each}
		</ul>
	</div>
{/if}
