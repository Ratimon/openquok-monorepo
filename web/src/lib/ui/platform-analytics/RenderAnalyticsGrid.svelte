<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	
	import { getAnalyticsPresenter } from '$lib/platform-analytics';
	import { toast } from '$lib/ui/sonner';
	import { integrationsRepository } from '$lib/integrations';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import { absoluteUrl } from '$lib/utils/path';

	import AnalyticsCard from '$lib/ui/platform-analytics/AnalyticsCard.svelte';
	import AnalyticsEmptyState from '$lib/ui/platform-analytics/AnalyticsEmptyState.svelte';

	type Props = {
		organizationId: string | null;
		integrations: CreateSocialPostChannelViewModel[];
		dateWindowDays: number;
	};

	let { organizationId, integrations, dateWindowDays }: Props = $props();

	const presenter = getAnalyticsPresenter;

	const integrationIdsKey = $derived.by(() => (integrations ?? []).map((i) => i.id).join(','));

	async function refreshIntegration(integration: CreateSocialPostChannelViewModel): Promise<void> {
		if (!organizationId) return;
		const r = await integrationsRepository.getAuthorizeUrl({
			organizationId,
			provider: integration.identifier,
			refresh: integration.internalId
		});
		if ('error' in r) {
			toast.error(r.error);
			return;
		}
		window.location.href = absoluteUrl(`${integrationOAuthCallbackPath(integration.identifier)}?${new URLSearchParams({
			organizationId,
			returnTo: '/account/analytics',
			refresh: integration.internalId
		}).toString()}`);
	}

	$effect(() => {
		void integrationIdsKey;
		void dateWindowDays;
		void organizationId;
		void presenter.loadMergedAnalytics({ organizationId, integrations, dateWindowDays });
	});

	const totals = $derived.by(() => presenter.formattedTotals);
	const series = $derived.by(() => presenter.mergedSeries);
	const loading = $derived.by(() => presenter.loading);
	const error = $derived.by(() => presenter.error);
	const showRefreshState = $derived.by(() => integrations.length === 1 && integrations[0]?.refreshNeeded);
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
		onAction={() => void refreshIntegration(integrations[0])}
	/>
{:else if series.length === 0}
	<div class="rounded-xl border border-base-300 bg-base-100/60 p-6 text-sm text-base-content/70">
		No analytics available for the selected channels.
	</div>
{:else}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each series as item, index (item.label)}
			<AnalyticsCard {item} total={totals[index]} {index} />
		{/each}
	</div>
{/if}

