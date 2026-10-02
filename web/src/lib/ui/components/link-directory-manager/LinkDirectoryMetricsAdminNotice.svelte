<script lang="ts">
	import { LINK_DIRECTORY_ADMIN_METRICS_COPY } from '$lib/link-directory/constants/linkDirectoryAdminMetricsCopy';
	import { formatMetricsUpdatedLabel } from '$lib/link-directory/utils/formatLinkDirectoryMetrics';

	type Props = {
		metricsUpdatedAt?: string | null;
		metricsSource?: string | null;
		compact?: boolean;
	};

	let { metricsUpdatedAt = null, metricsSource = null, compact = false }: Props = $props();

	const copy = LINK_DIRECTORY_ADMIN_METRICS_COPY;
	const updatedLabel = $derived(formatMetricsUpdatedLabel(metricsUpdatedAt));
</script>

<aside
	class="rounded-xl border border-base-300/80 bg-base-200/40 p-4 text-sm text-base-content/80 space-y-3"
	aria-labelledby="link-directory-metrics-admin-heading"
>
	<div>
		<h2 id="link-directory-metrics-admin-heading" class="font-semibold text-base-content">
			{copy.title}
		</h2>
		<p class="mt-1">{copy.intro}</p>
	</div>

	{#if updatedLabel || metricsSource?.trim()}
		<p class="text-xs text-base-content/70">
			{#if updatedLabel && metricsSource?.trim()}
				Public last updated: <strong>{updatedLabel}</strong>. Source:
				<span class="font-mono">{metricsSource.trim()}</span>.
			{:else if updatedLabel}
				Public last updated: <strong>{updatedLabel}</strong>.
			{:else if metricsSource?.trim()}
				Source: <span class="font-mono">{metricsSource.trim()}</span>.
			{/if}
		</p>
	{/if}

	{#if !compact}
		<div>
			<p class="font-medium text-base-content">V1 workflow</p>
			<ul class="mt-1 list-disc list-inside space-y-0.5">
				{#each copy.v1Bullets as bullet (bullet)}
					<li>{bullet}</li>
				{/each}
			</ul>
		</div>

		<div>
			<p class="font-medium text-base-content">{copy.phase2DeferredTitle}</p>
			<p class="mt-1">{copy.phase2DeferredBody}</p>
			<ul class="mt-2 list-disc list-inside space-y-0.5">
				{#each copy.phase2OperatorBullets as bullet (bullet)}
					<li>{bullet}</li>
				{/each}
			</ul>
		</div>

		<p class="text-xs text-base-content/60">{copy.publicSiteNote}</p>
	{/if}
</aside>
