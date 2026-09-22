<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { AnalyticsSeriesViewModel } from '$lib/platform-analytics/GetAnalytics.presenter.svelte';

	import { socialProviderDisplayLabel, socialProviderIcon } from '$data/social-providers';

	import AnalyticsCard from '$lib/ui/components/platform-analytics/AnalyticsCard.svelte';
	import AnalyticsEmptyState from '$lib/ui/components/platform-analytics/AnalyticsEmptyState.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

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

	type AnalyticsGridItem = {
		series: AnalyticsSeriesViewModel;
		total: string;
		cardIndex: number;
	};

	type AnalyticsChannelSection = {
		integrationId: string;
		providerIdentifier: string;
		channelName: string;
		picture: string | null;
		items: AnalyticsGridItem[];
	};

	const showRefreshState = $derived.by(
		() => integrationVm.length === 1 && integrationVm[0]?.refreshNeeded
	);

	const showChannelSections = $derived(integrationVm.length > 1);

	const channelSections = $derived.by((): AnalyticsChannelSection[] => {
		const integrationById = new Map(integrationVm.map((integration) => [integration.id, integration]));
		const order: string[] = [];
		const itemsByIntegration = new Map<string, AnalyticsGridItem[]>();

		seriesVm.forEach((series, index) => {
			const integrationId =
				series.integrationId?.trim() ||
				integrationVm.find((i) => i.identifier === series.providerIdentifier)?.id ||
				integrationVm[0]?.id ||
				'default';

			if (!itemsByIntegration.has(integrationId)) {
				order.push(integrationId);
				itemsByIntegration.set(integrationId, []);
			}
			itemsByIntegration.get(integrationId)!.push({
				series,
				total: totals[index] ?? '',
				cardIndex: index
			});
		});

		return order.map((integrationId) => {
			const integration = integrationById.get(integrationId);
			const firstSeries = itemsByIntegration.get(integrationId)?.[0]?.series;
			return {
				integrationId,
				providerIdentifier: integration?.identifier ?? firstSeries?.providerIdentifier ?? '',
				channelName: integration?.name ?? firstSeries?.channelName ?? '',
				picture: integration?.picture ?? null,
				items: itemsByIntegration.get(integrationId) ?? []
			};
		});
	});

	function seriesCardKey(series: AnalyticsSeriesViewModel, integrationId: string): string {
		const id = series.integrationId?.trim() || integrationId;
		return `${id}-${series.label}`;
	}
</script>

{#if loading}
	<div class="flex items-center justify-center py-10 text-sm text-base-content/70">
		Loading analytics…
	</div>
{:else if error}
	<div class="rounded-xl border border-base-300 bg-base-100/60 p-6 text-sm text-error">
		{error}</div>
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
	<div class="space-y-8">
		{#each channelSections as section (section.integrationId)}
			{#if showChannelSections}
				<div class="flex items-center gap-3">
					<IntegrationChannelPicture
						profilePictureUrl={section.picture}
						integrationId={section.integrationId}
						fallbackIcon={socialProviderIcon(section.providerIdentifier)}
						alt=""
						class="h-9 w-9 shrink-0 rounded-full"
					/>
					<div class="min-w-0">
						<p class="truncate text-sm font-semibold text-base-content">
							{section.channelName}
						</p>
						{#if section.providerIdentifier}
							<p class="flex items-center gap-1 text-xs text-base-content/60">
								<AbstractIcon
									name={socialProviderIcon(section.providerIdentifier)}
									class="size-3 shrink-0"
									width="12"
									height="12"
									aria-hidden="true"
								/>
								<span>{socialProviderDisplayLabel(section.providerIdentifier)}</span>
							</p>
						{/if}
					</div>
				</div>
			{/if}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each section.items as item (seriesCardKey(item.series, section.integrationId))}
					<AnalyticsCard
						seriesVm={item.series}
						total={item.total}
						index={item.cardIndex}
					/>
				{/each}
			</div>
		{/each}
	</div>
{/if}
