<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	// --- Navigation & routing ---
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';

	// --- Area presenters (singletons from composition root) ---
	import {
		getRootPathAccount,
		protectedAnalyticsPagePresenter,
		protectedDashboardPagePresenter
	} from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';

	// --- Feedback ---
	import { toast } from '$lib/ui/sonner';

	// --- Data / icons ---
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	// --- UI ---
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';
	import SocialChannelFilter from '$lib/ui/components/calendar-scheduler/SocialChannelFilter.svelte';
	import RenderAnalyticsGrid from '$lib/ui/components/platform-analytics/RenderAnalyticsGrid.svelte';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/ui/select';

	/** Same singleton as exported name; shorter reads in markup (matches calendar page pattern). */
	const analyticsPresenter = protectedAnalyticsPagePresenter;

	// --- Routes (static, base-aware via `route`) ---
	const accountRoot = route(getRootPathAccount());

	// --- Workspace + integration list (dashboard presenter is source of truth) ---
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const connectedChannelsVm = $derived(protectedDashboardPagePresenter.connectedChannelsVm);
	const listStatus = $derived(protectedDashboardPagePresenter.listStatus);
	const channelsLoadPending = $derived(listStatus === 'idle' || listStatus === 'loading');

	// --- Analytics screen VM (filters + merged series live on analytics presenter) ---
	const supportedIntegrations = $derived(analyticsPresenter.supportedIntegrations);
	const filteredIntegrationsVm = $derived(analyticsPresenter.filteredIntegrationsVm);

	/** Triggers reload when targeted integration set changes (platform filter / disconnect). */
	const analyticsIntegrationIdsKey = $derived.by(() => filteredIntegrationsVm.map((i) => i.id).join(','));

	// --- Page-local UI state ---
	let dateWindowDays = $state<number>(7);

	// --- Handlers (Pattern B: toast in route after mutation-style results) ---
	function goToCalendarToAddChannels() {
		void goto(`${accountRoot}/calendar`);
	}

	function supportedLabel(identifier: string): string {
		return identifier
			.split('-')
			.filter(Boolean)
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join('-');
	}

	async function handleRemoveChannel(id: string): Promise<boolean> {
		const resultVm = await protectedDashboardPagePresenter.removeChannel(id);
		if (resultVm.ok) {
			toast.success('Channel removed.');
			return true;
		}
		toast.error(resultVm.error);
		return false;
	}

	async function handleSetChannelDisabled(id: string, disabled: boolean): Promise<boolean> {
		const resultVm = await protectedDashboardPagePresenter.setChannelDisabled(id, disabled);
		if (resultVm.ok) {
			toast.success(disabled ? 'Channel disabled.' : 'Channel enabled.');
			return true;
		}
		toast.error(resultVm.error);
		return false;
	}

	function handleRefreshIntegration(integration: CreateSocialPostChannelViewModel) {
		// Authorize-url fetch, error toast, and redirect are handled by the presenter.
		void analyticsPresenter.refreshIntegrationForAnalytics(integration);
	}

	// --- Effects: keep lists warm, then load merged analytics when inputs change ---
	$effect(() => {
		const orgId = workspaceId;
		if (!orgId) return;
		analyticsPresenter.syncWorkspaceDashboardLists();
	});

	$effect(() => {
		void analyticsIntegrationIdsKey;
		void dateWindowDays;
		void workspaceId;
		void analyticsPresenter.loadMergedAnalytics({
			organizationId: workspaceId,
			integrations: filteredIntegrationsVm,
			dateWindowDays
		});
	});
</script>

<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="space-y-1">
			<h2 class="text-2xl font-bold text-base-content">
				Analytics</h2>
			<p class="text-base-content/70 text-sm">
				Track performance across your connected channels.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button type="button" variant="outline" href={route(getRootPathAccount())}>
				<AbstractIcon name={icons.ArrowLeft.name} class="size-4" width="16" height="16" />
				Back to dashboard
			</Button>
		</div>
	</div>

	{#if !workspaceId}
		<p class="text-sm text-base-content/70">
			Select or create a workspace to load analytics.</p>
	{:else if channelsLoadPending}
		<p class="flex items-center gap-2 text-sm text-base-content/70">
			<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
			Loading channels…
		</p>
	{:else if listStatus === 'error'}
		<p class="text-sm text-error">
			Could not load channels. Try again in a moment.</p>
	{:else if connectedChannelsVm.length === 0}
		<div class="space-y-4 text-center py-10">
			<div class="mx-auto max-w-xl space-y-3">
				<p class="text-3xl font-semibold text-base-content">
					Can’t show analytics yet</p>
				<p class="text-base-content/70 text-sm">
					You have to add Social Media channels.</p>
				<p class="text-base-content/70 text-sm">
					Supported: {supportedIntegrations.map(supportedLabel).join(', ')}
				</p>
			</div>
			<div class="flex justify-center">
				<Button type="button" variant="primary" onclick={goToCalendarToAddChannels}>
					Go to the calendar to add channels
				</Button>
			</div>
		</div>
	{:else}
		<section class="space-y-3">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h3 class="text-lg font-semibold text-base-content">
					Targeted channels</h3>
				<div class="flex flex-wrap items-center justify-end gap-2">
					<SocialChannelFilter
						channels={connectedChannelsVm}
						allSocialPlatforms={analyticsPresenter.platformFilterVm.allSocialPlatforms}
						selectedSocialPlatformIdentifiers={
							analyticsPresenter.platformFilterVm.selectedSocialPlatformIdentifiers
						}
						onChange={(next) => (analyticsPresenter.platformFilterVm = next)}
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
				<ul class="flex list-none flex-row flex-wrap items-center gap-2 p-0">
					{#each filteredIntegrationsVm as integration (integration.id)}
						<li class="min-w-0">
							<IntegrationMenu
								variant="chip"
								showProviderBadge={true}
								{integration}
								workspaceId={workspaceId}
								providerIcon={socialProviderIcon}
								continueSetupHref={(i) => analyticsPresenter.continueSetupHref(i)}
								onMoveToGroup={() => {}}
								onEditTimeSlots={() => {}}
								onSetDisabled={handleSetChannelDisabled}
								onRemove={handleRemoveChannel}
							/>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="space-y-3">
			<h3 class="text-lg font-semibold text-base-content">
				Overview
			</h3>
			<RenderAnalyticsGrid
				integrationVm={filteredIntegrationsVm}
				loading={analyticsPresenter.loading}
				error={analyticsPresenter.error}
				seriesVm={analyticsPresenter.mergedSeriesVm}
				totals={analyticsPresenter.mergedTotalsVm}
				onRefreshIntegration={handleRefreshIntegration}
			/>
		</section>
	{/if}
</div>
