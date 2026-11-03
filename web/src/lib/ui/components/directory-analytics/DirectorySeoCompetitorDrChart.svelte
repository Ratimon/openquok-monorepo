<script lang="ts">
	import type { DirectorySeoCompetitorDto, DirectorySeoDomainMetricDto } from '$lib/directory-seo';

	import { scaleBand, scaleLinear } from 'd3-scale';
	import { BarChart } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	import { directorySeoChartColorAt } from '$lib/directory-seo/directorySeoChartColors';

	import * as Chart from '$lib/ui/chart';

	type Props = {
		productDomain: DirectorySeoDomainMetricDto | null;
		competitors: DirectorySeoCompetitorDto[];
	};

	let { productDomain, competitors }: Props = $props();

	type CompareRow = {
		name: string;
		detail: string;
		rating: number;
		color: string;
	};

	const chartData = $derived.by((): CompareRow[] => {
		const rows: CompareRow[] = [];
		let colorIndex = 0;
		if (productDomain?.domainRating != null && Number.isFinite(productDomain.domainRating)) {
			const domain = productDomain.domain?.trim() ?? '';
			rows.push({
				name: 'You',
				detail: domain ? `Your domain (${domain})` : 'Your domain',
				rating: Math.round(productDomain.domainRating),
				color: directorySeoChartColorAt(colorIndex)
			});
			colorIndex += 1;
		}
		for (const competitor of competitors) {
			if (competitor.domainRating == null || !Number.isFinite(competitor.domainRating)) continue;
			const label = competitor.label?.trim();
			rows.push({
				name: label || competitor.domain,
				detail: label ? `${label} (${competitor.domain})` : competitor.domain,
				rating: Math.round(competitor.domainRating),
				color: directorySeoChartColorAt(colorIndex)
			});
			colorIndex += 1;
		}
		return rows;
	});

	const chartConfig = $derived.by((): Chart.ChartConfig => {
		const config: Chart.ChartConfig = {};
		for (const row of chartData) {
			config[row.name] = { label: row.detail, color: row.color };
		}
		return config;
	});

	const chartHeightClass = $derived.by(() => {
		const rows = chartData.length;
		if (rows <= 1) return 'h-24';
		if (rows === 2) return 'h-32';
		return 'h-44';
	});

	const chartPaddingLeft = $derived.by(() => {
		const longest = chartData.reduce((max, row) => Math.max(max, row.name.length), 4);
		return Math.min(200, Math.max(56, longest * 7 + 16));
	});

	function truncateLabel(label: string, max = 22): string {
		const trimmed = label.trim();
		if (trimmed.length <= max) return trimmed;
		return `${trimmed.slice(0, max - 1)}…`;
	}
</script>

{#if chartData.length === 0}
	<p class="text-sm text-base-content/65">Add competitors or refresh ratings to compare domain scores.</p>
{:else}
	<Chart.Container config={chartConfig} class="aspect-auto w-full min-h-[6rem] {chartHeightClass}">
		<BarChart
			data={chartData}
			orientation="horizontal"
			yScale={scaleBand().padding(0.3)}
			xScale={scaleLinear().domain([0, 100]).nice()}
			y="name"
			x="rating"
			c="color"
			padding={{ left: chartPaddingLeft, right: 12, top: 8, bottom: 8 }}
			grid={{ x: true, y: false }}
			rule={false}
			axis={true}
			series={[{ key: 'rating', label: 'Domain rating', color: directorySeoChartColorAt(0) }]}
			props={{
				bars: {
					stroke: 'none',
					radius: 6,
					rounded: 'all',
					motion: { type: 'tween', duration: 400, easing: cubicInOut }
				},
				highlight: { area: { fill: 'none' } },
				yAxis: { format: (d: string) => truncateLabel(d) },
				xAxis: { format: (d: number) => String(Math.round(d)) }
			}}
		>
			{#snippet tooltip()}
				<Chart.Tooltip />
			{/snippet}
		</BarChart>
	</Chart.Container>
{/if}
