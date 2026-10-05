<script lang="ts">
	import type { Snippet } from 'svelte';

	import InternalLink from '$lib/ui/links/InternalLink.svelte';

	type MetricRow = { label: string; value: string };

	type Props = {
		categoryName?: string | null;
		categoryHref?: string | null;
		metricRows: MetricRow[];
		metricsHeading?: string;
		footnote?: string | null;
		ariaLabel?: string;
		topRow?: Snippet;
		actions?: Snippet;
		class?: string;
	};

	let {
		categoryName = null,
		categoryHref = null,
		metricRows,
		metricsHeading = 'Community stats',
		footnote = null,
		ariaLabel = 'Listing details',
		topRow,
		actions,
		class: className = ''
	}: Props = $props();
</script>

<aside class={className} aria-label={ariaLabel}>
	<div
		class="space-y-5 rounded-xl border border-primary/25 bg-primary/5 p-4 shadow-sm shadow-primary/5 sm:p-5"
	>
		{#if topRow || categoryName}
			<div class="flex flex-wrap items-center gap-2">
				{#if topRow}
					{@render topRow()}
				{/if}
				{#if categoryName}
					{#if categoryHref}
						<InternalLink
							href={categoryHref}
							class="badge badge-outline no-underline hover:border-primary hover:bg-base-content/5"
						>
							{categoryName}
						</InternalLink>
					{:else}
						<span class="badge badge-outline">{categoryName}</span>
					{/if}
				{/if}
			</div>
		{/if}

		{#if metricRows.length > 0}
			<div>
				<h2 class="text-xs font-semibold tracking-wide text-primary/90 uppercase">{metricsHeading}</h2>
				<dl class="mt-3 space-y-3">
					{#each metricRows as row (row.label)}
						<div class="flex items-baseline justify-between gap-3">
							<dt class="text-sm text-base-content/65">{row.label}</dt>
							<dd class="text-sm font-semibold text-base-content tabular-nums">{row.value}</dd>
						</div>
					{/each}
				</dl>
			</div>
		{/if}

		{#if footnote}
			<p class="text-xs leading-relaxed text-base-content/50">{footnote}</p>
		{/if}

		{#if actions}
			<div class="flex flex-col gap-2">
				{@render actions()}
			</div>
		{/if}
	</div>
</aside>
