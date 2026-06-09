<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

	import ChannelKindFilter from '$lib/ui/components/filters/ChannelKindFilter.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';
	import RenderAnalyticsGrid from '$lib/ui/components/platform-analytics/RenderAnalyticsGrid.svelte';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/ui/select';

	import {
		buildInstagramLandingAnalyticsVm,
		landingInstagramAnalyticsProviderIcon
	} from '$lib/ui/templates/bento/minor-templates/instagramLandingAnalyticsMock';
	import { INSTAGRAM_LANDING_ANALYTICS_MOCK_CHANNELS } from '$lib/ui/templates/bento/minor-templates/instagramLandingMock';

	const mockChannels = INSTAGRAM_LANDING_ANALYTICS_MOCK_CHANNELS;
	const mockWorkspaceId = 'landing-mock-workspace';

	let platformFilterVm = $state({
		allSocialPlatforms: true,
		selectedSocialPlatformIdentifiers: [] as string[]
	});
	let dateWindowDays = $state<number>(7);

	const filteredIntegrationsVm = $derived.by(() => {
		if (platformFilterVm.allSocialPlatforms) return mockChannels;
		const selected = new Set(platformFilterVm.selectedSocialPlatformIdentifiers);
		return mockChannels.filter((channel) => selected.has(channel.identifier));
	});

	const analyticsVm = $derived(
		buildInstagramLandingAnalyticsVm(
			dateWindowDays,
			filteredIntegrationsVm.map((channel) => channel.identifier)
		)
	);

	function noop() {}
	function noopRefresh(_integration: CreateSocialPostChannelViewModel) {}
</script>

<div class="bg-base-100 text-base-content">
	<section class="space-y-3 border-b border-base-300 px-4 py-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h3 class="text-base font-semibold text-base-content">
				Targeted channels
			</h3>
			<div class="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
				<ChannelKindFilter
					channels={mockChannels}
					allSocialPlatforms={platformFilterVm.allSocialPlatforms}
					selectedSocialPlatformIdentifiers={platformFilterVm.selectedSocialPlatformIdentifiers}
					providerIcon={landingInstagramAnalyticsProviderIcon}
					onChange={(next) => (platformFilterVm = next)}
				/>

				<div class="w-[200px]">
					<Select type="single" value={String(dateWindowDays)} onValueChange={(v) => (dateWindowDays = Number(v))}>
						<SelectTrigger class="border-base-300 bg-base-100/60">
							<span class="text-sm">{dateWindowDays} Days</span>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">7 Days</SelectItem>
							<SelectItem value="30">30 Days</SelectItem>
							<SelectItem value="90">90 Days</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>

		{#if filteredIntegrationsVm.length === 0}
			<p class="text-sm text-base-content/70">
				No channels match the current filter.</p>
		{:else}
			<ul class="pointer-events-none flex list-none flex-row flex-wrap items-center gap-2 p-0">
				{#each filteredIntegrationsVm as integration (integration.id)}
					<li class="min-w-0">
						<IntegrationMenu
							variant="chip"
							showProviderBadge={true}
							{integration}
							workspaceId={mockWorkspaceId}
							providerIcon={landingInstagramAnalyticsProviderIcon}
							continueSetupHref={() => '#'}
							onMoveToGroup={noop}
							onEditTimeSlots={noop}
							onSetDisabled={async () => false}
							onRemove={async () => false}
						/>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="space-y-3 px-4 py-4">
		<h3 class="text-base font-semibold text-base-content">
			Overview
		</h3>
		<RenderAnalyticsGrid
			integrationVm={filteredIntegrationsVm}
			loading={false}
			error={null}
			seriesVm={analyticsVm.seriesVm}
			totals={analyticsVm.totals}
			onRefreshIntegration={noopRefresh}
		/>
	</section>
</div>
