<script lang="ts">
	import type { DirectorySeoCompetitorDto, DirectorySeoDomainMetricDto } from '$lib/directory-seo';

	import { scaleBand, scaleLinear } from 'd3-scale';
	import { BarChart } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	import * as Chart from '$lib/ui/chart';

	type Props = {
		productDomain: DirectorySeoDomainMetricDto | null;
		competitors: DirectorySeoCompetitorDto[];
	};

	let { productDomain, competitors }: Props = $props();

	type CompareRow = {
		name: string;
		rating: number;
	};

	const chartData = $derived.by((): CompareRow[] => {
		const rows: CompareRow[] = [];
		if (productDomain?.domainRating != null && Number.isFinite(productDomain.domainRating)) {
			const label = productDomain.domain
				? `You (${productDomain.domain})`
				: 'Your domain';
			rows.push({
				name: label,
				rating: Math.round(productDomain.domainRating)
			});
		}
		for (const competitor of competitors) {
			if (competitor.domainRating == null || !Number.isFinite(competitor.domainRating)) continue;
			rows.push({
				name: competitor.label?.trim() || competitor.domain,
				rating: Math.round(competitor.domainRating)
			});
		}
		return rows;
	});

	const chartConfig = {
		rating: { label: 'Domain rating', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;

	const chartHeightClass = $derived.by(() => {
		const rows = chartData.length;
		if (rows <= 1) return 'h-24';
		if (rows === 2) return 'h-32';
		return 'h-44';
	});

	function truncateLabel(label: string, max = 28): string {
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
			padding={{ left: 8, right: 8 }}
			grid={{ x: true, y: false }}
			rule={false}
			axis={true}
			series={[{ key: 'rating', label: chartConfig.rating.label, color: chartConfig.rating.color }]}
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
				<Chart.Tooltip hideLabel />
			{/snippet}
		</BarChart>
	</Chart.Container>
{/if}
