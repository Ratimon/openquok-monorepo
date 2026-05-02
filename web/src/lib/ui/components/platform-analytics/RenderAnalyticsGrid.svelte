<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { AnalyticsSeriesViewModel } from '$lib/platform-analytics/GetAnalytics.presenter.svelte';

	import AnalyticsCard from '$lib/ui/components/platform-analytics/AnalyticsCard.svelte';
	import AnalyticsEmptyState from '$lib/ui/components/platform-analytics/AnalyticsEmptyState.svelte';

	type Props = {
		integrationVm: CreateSocialPostChannelViewModel[];
		loading: boolean;
		error: string | null;
		seriesVm: AnalyticsSeriesViewModel[];
		totals: string[];
		onRefreshIntegration: (integration: CreateSocialPostChannelViewModel) => void | Promise<void>;
	};

	let {
		integrationVm,
		loading,
		error,
		seriesVm,
		totals,
		onRefreshIntegration
	}: Props = $props();

	const showRefreshState = $derived.by(
		() => integrationVm.length === 1 && integrationVm[0]?.refreshNeeded
	);
</script>

{#if loading}
	<div class="flex items-center justify-center py-10 text-sm text-base-content/70">
		Loading analytics…
	</div>
{:else if error}
	<div class="rounded-xl border border-base-300 bg-base-100/60 p-6 text-sm text-error">{error}</div>
{:else if showRefreshState}
	<AnalyticsEmptyState
		title="This channel needs to be refreshed"
		description="Refresh this channel to display analytics."
		actionLabel="Refresh channel"
		onAction={() => void onRefreshIntegration(integrationVm[0])}
	/>
{:else if seriesVm.length === 0}
	<div class="rounded-xl border border-base-300 bg-base-100/60 p-6 text-sm text-base-content/70">
		No analytics available for the selected channels.
	</div>
{:else}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each seriesVm as item, index (item.label)}
			<AnalyticsCard
				seriesVm={item}
				total={totals[index]}
				index={index}
			/>
		{/each}
	</div>
{/if}
