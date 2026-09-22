<script lang="ts">
	import {
		alignChartLineValues,
		type AnalyticsOverviewChartLineVm
	} from '$lib/platform-analytics/GetAnalytics.presenter.svelte';

	import { socialProviderDisplayLabel, socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		dates: string[];
		lines: AnalyticsOverviewChartLineVm[];
	};

	let { dates, lines }: Props = $props();

	const strokeVariants = [
		'stroke-purple-400',
		'stroke-emerald-400',
		'stroke-sky-400',
		'stroke-amber-400',
		'stroke-rose-400',
		'stroke-violet-400'
	] as const;

	const viewBox = '0 0 100 48';

	const paths = $derived.by(() => {
		if (dates.length === 0 || lines.length === 0) return [];

		const allValues = lines.flatMap((line) => alignChartLineValues(line, dates));
		const minY = Math.min(...allValues, 0);
		const maxY = Math.max(...allValues, 0);
		const spanY = maxY - minY || 1;

		return lines.map((line, lineIndex) => {
			const values = alignChartLineValues(line, dates);
			const d =
				values.length <= 1
					? values.length === 1
						? `M 0 ${(44 - ((values[0]! - minY) / spanY) * 40).toFixed(2)} L 100 ${(44 - ((values[0]! - minY) / spanY) * 40).toFixed(2)}`
						: ''
					: values
							.map((yVal, i) => {
								const x = (i / (values.length - 1)) * 100;
								const y = 44 - ((yVal - minY) / spanY) * 40;
								return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
							})
							.join(' ');

			return {
				line,
				d,
				strokeClass: strokeVariants[lineIndex % strokeVariants.length]
			};
		});
	});

	function formatAxisDate(date: string): string {
		const trimmed = date.trim();
		if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
			const [, month, day] = trimmed.split('-');
			return `${month}/${day}`;
		}
		return trimmed.length > 8 ? `${trimmed.slice(0, 8)}…` : trimmed;
	}

	const startLabel = $derived(dates[0] ? formatAxisDate(dates[0]) : '');
	const endLabel = $derived(dates.length > 1 ? formatAxisDate(dates[dates.length - 1]!) : '');
</script>

{#if lines.length === 0}
	<p class="py-8 text-center text-sm text-base-content/60">
		No daily series match this metric family for the selected channels.
	</p>
{:else}
	<div class="space-y-3">
		<div class="h-44 w-full">
			<svg
				class="h-full w-full"
				viewBox={viewBox}
				preserveAspectRatio="none"
				role="img"
				aria-label="Multi-channel trend chart"
			>
				{#each paths as path (path.line.integrationId)}
					{#if path.d}
						<path
							d={path.d}
							class="{path.strokeClass} fill-none"
							stroke-width="2"
							stroke-linecap="round"
							vector-effect="non-scaling-stroke"
						/>
					{/if}
				{/each}
			</svg>
		</div>
		{#if startLabel || endLabel}
			<div class="flex justify-between px-1 text-[10px] text-base-content/50">
				<span>{startLabel}</span>
				<span>{endLabel}</span>
			</div>
		{/if}
		<ul class="flex list-none flex-wrap gap-x-4 gap-y-2 p-0 text-xs text-base-content/80">
			{#each paths as path (path.line.integrationId)}
				<li class="flex min-w-0 max-w-full items-center gap-1.5">
					<span
						class="h-2 w-2 shrink-0 rounded-full {path.strokeClass.replace('stroke-', 'bg-')}"
						aria-hidden="true"
					></span>
					{#if path.line.providerIdentifier}
						<AbstractIcon
							name={socialProviderIcon(path.line.providerIdentifier)}
							class="size-3 shrink-0"
							width="12"
							height="12"
							aria-hidden="true"
						/>
					{/if}
					<span class="truncate font-medium" title={path.line.channelName}>
						{path.line.channelName || socialProviderDisplayLabel(path.line.providerIdentifier)}
					</span>
					<span class="shrink-0 text-base-content/50">({path.line.sourceMetricLabel})</span>
				</li>
			{/each}
		</ul>
	</div>
{/if}
