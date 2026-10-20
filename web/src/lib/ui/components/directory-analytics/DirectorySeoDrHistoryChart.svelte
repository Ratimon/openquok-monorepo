<script lang="ts">
	import type { DirectorySeoHistoryPointDto } from '$lib/directory-seo';
	import { dedupeDirectorySeoHistoryByDay } from '$lib/directory-seo/dedupeDirectorySeoHistoryByDay';

	import { scaleUtc } from 'd3-scale';
	import { curveMonotoneX } from 'd3-shape';
	import { LineChart } from 'layerchart';

	import * as Chart from '$lib/ui/chart';

	type Props = {
		points: DirectorySeoHistoryPointDto[];
	};

	let { points }: Props = $props();

	const sorted = $derived(dedupeDirectorySeoHistoryByDay(points));

	const chartData = $derived(
		sorted
			.filter((point) => point.domainRating != null && Number.isFinite(point.domainRating))
			.map((point) => ({
				date: new Date(point.capturedAt),
				rating: Math.round(point.domainRating as number)
			}))
	);

	const chartConfig = {
		rating: { label: 'Domain rating', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;

	function formatAxisDate(value: Date): string {
		return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}
</script>

{#if chartData.length === 0}
	<p class="py-8 text-center text-sm text-base-content/60">No domain rating history yet.</p>
{:else}
	<Chart.Container config={chartConfig} class="aspect-auto h-52 w-full min-h-[12rem]">
		<LineChart
			data={chartData}
			x="date"
			y="rating"
			yDomain={[0, 100]}
			xScale={scaleUtc()}
			axis={true}
			grid
			series={[
				{
					key: 'rating',
					label: chartConfig.rating.label,
					color: chartConfig.rating.color
				}
			]}
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
{/if}
