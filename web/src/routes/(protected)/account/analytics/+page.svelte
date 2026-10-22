<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';

	// --- Navigation & routing ---
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { route, url } from '$lib/utils/path';

	// --- Area presenters (singletons from composition root) ---
	import {
		getRootPathAccount,
		protectedAnalyticsPagePresenter,
		protectedHomePagePresenter
	} from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';

	// --- Feedback ---
	import { toast } from '$lib/ui/sonner';

	// --- Data / icons ---
	import { icons } from '$data/icons';
	import {
		clampAnalyticsDateWindow,
		intersectAnalyticsDateWindows,
		socialProviderIcon
	} from '$data/social-providers';

	// --- UI ---
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AccountAreaPageHeaderSync from '$lib/ui/components/account/AccountAreaPageHeaderSync.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';
	import {
		channelCapKey,
		openChannelLimitDialogForMutation,
		type ChannelCapContext
	} from '$lib/ui/components/channels/channelCapContext';
	import ChannelKindFilter from '$lib/ui/components/filters/ChannelKindFilter.svelte';
	import AnalyticsOverviewPanel from '$lib/ui/components/platform-analytics/AnalyticsOverviewPanel.svelte';
	import RenderAnalyticsGrid from '$lib/ui/components/platform-analytics/RenderAnalyticsGrid.svelte';
	import DirectoryAnalyticsWorkspacePanel from '$lib/ui/components/directory-analytics/DirectoryAnalyticsWorkspacePanel.svelte';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/ui/select';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	const pagePresenter = protectedAnalyticsPagePresenter;
	const channelCapCtx = getContext<ChannelCapContext | undefined>(channelCapKey);

	// --- Routes (static, base-aware via `route`) ---
	const accountRoot = accountPath;
	const accountBillingHref = $derived(url(`${accountRoot}/billing`));
	const directoryCreateProfileHref = $derived(
		pagePresenter.getDirectoryCreateProfileHref(accountPath)
	);
	const directoryEditProfileWebsiteHref = $derived(
		pagePresenter.getDirectoryEditProfileWebsiteHref(accountPath)
	);

	// --- Workspace + integration list (home presenter is source of truth) ---
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const connectedChannelsVm = $derived(protectedHomePagePresenter.connectedChannelsVm);
	const listStatus = $derived(protectedHomePagePresenter.listStatus);
	const channelsLoadPending = $derived(listStatus === 'idle' || listStatus === 'loading');

	// --- Analytics screen VM (filters + merged series live on analytics presenter) ---
	const supportedIntegrations = $derived(pagePresenter.supportedIntegrations);
	const filteredIntegrationsVm = $derived(pagePresenter.filteredIntegrationsVm);

	/** Triggers reload when targeted integration set changes (platform filter / disconnect). */
	const analyticsIntegrationIdsKey = $derived.by(() => filteredIntegrationsVm.map((i) => i.id).join(','));
	const analyticsScopeTab = $derived(pagePresenter.analyticsScopeTab);
	const directorySeoEnabled = $derived(pagePresenter.directorySeoEnabled);

	const allowedDateWindowDays = $derived(
		intersectAnalyticsDateWindows(filteredIntegrationsVm.map((i) => String(i.identifier ?? '')))
	);

	// --- Page-local UI state ---
	let dateWindowDays = $state<number>(7);

	$effect(() => {
		const next = clampAnalyticsDateWindow(dateWindowDays, allowedDateWindowDays);
		if (next !== dateWindowDays) {
			dateWindowDays = next;
		}
	});

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
		const resultVm = await protectedHomePagePresenter.removeChannel(id);
		if (resultVm.ok) {
			setTimeout(() => toast.success('Channel removed.'), 0);
			return true;
		}
		setTimeout(() => toast.error(resultVm.error), 0);
		return false;
	}

	async function handleSetChannelDisabled(id: string, disabled: boolean): Promise<boolean> {
		const resultVm = await protectedHomePagePresenter.setChannelDisabled(id, disabled);
		if (resultVm.ok) {
			toast.success(disabled ? 'Channel disabled.' : 'Channel enabled.');
			return true;
		}
		openChannelLimitDialogForMutation(resultVm.limitKind, channelCapCtx);
		toast.error(resultVm.error);
		return false;
	}

	function handleRefreshIntegration(integration: CreateSocialPostChannelViewModel) {
		// Authorize-url fetch, error toast, and redirect are handled by the presenter.
		void pagePresenter.refreshIntegrationForAnalytics(integration);
	}

	// --- Effects: keep lists warm, then load merged analytics when inputs change ---
	$effect(() => {
		if (analyticsScopeTab !== 'social') return;
		const orgId = workspaceId;
		if (!orgId) return;
		pagePresenter.syncWorkspaceHomeLists();
	});

	$effect(() => {
		if (analyticsScopeTab !== 'social') return;
		void analyticsIntegrationIdsKey;
		void dateWindowDays;
		void workspaceId;
		void pagePresenter.loadMergedAnalytics({
			organizationId: workspaceId,
			integrations: filteredIntegrationsVm,
			dateWindowDays
		});
	});

	$effect(() => {
		void workspaceId;
		void pagePresenter.loadDirectoryEntitlement(workspaceId);
	});

	$effect(() => {
		if (!directorySeoEnabled || analyticsScopeTab !== 'directory') return;
		void workspaceId;
		void pagePresenter.loadDirectoryMainProfiles(workspaceId);
	});

	$effect(() => {
		if (analyticsScopeTab !== 'directory' || !directorySeoEnabled) return;
		void workspaceId;
		void pagePresenter.selectedDirectoryProfileId;
		void pagePresenter.directoryHistoryWindowDays;
		void pagePresenter.loadDirectoryAnalytics(workspaceId);
	});
</script>

<AccountAreaPageHeaderSync
	title="Analytics"
	currentPageLabel="Analytics"
	headingId="account-analytics-heading"
	description="Track performance across your connected channels."
/>

<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="inline-flex rounded-lg border border-base-300 p-0.5">
			<Button
				type="button"
				variant={analyticsScopeTab === 'social' ? 'primary' : 'ghost'}
				size="sm"
				class="rounded-md"
				onclick={() => (pagePresenter.analyticsScopeTab = 'social')}
			>
				Social
			</Button>
			<Button
				type="button"
				variant={analyticsScopeTab === 'directory' ? 'primary' : 'ghost'}
				size="sm"
				class="rounded-md"
				disabled={!directorySeoEnabled}
				title={directorySeoEnabled ? undefined : 'Upgrade to a paid plan for directory analytics'}
				onclick={() => (pagePresenter.analyticsScopeTab = 'directory')}
			>
				Directory
			</Button>
		</div>
		<div class="flex items-center gap-2">
			<Button type="button" variant="outline" href={accountPath}>
				<AbstractIcon name={icons.ArrowLeft.name} class="size-4" width="16" height="16" />
				Back to home
			</Button>
		</div>
	</div>

	{#if !workspaceId}
		<p class="text-sm text-base-content/70">
			Select or create a workspace to load analytics.</p>
	{:else if analyticsScopeTab === 'directory'}
		{#if !directorySeoEnabled}
			<p class="text-sm text-base-content/70">
				Directory analytics (domain rating trends and competitors) is available on paid plans.
			</p>
		{:else}
			<DirectoryAnalyticsWorkspacePanel
				loading={pagePresenter.directorySeoLoading}
				error={pagePresenter.directorySeoError}
				mainProfiles={pagePresenter.directoryMainProfilesVm}
				selectedProfileId={pagePresenter.selectedDirectoryProfileId}
				selectedProfileName={pagePresenter.directorySelectedMainProfileVm?.name ?? null}
				missingWebsiteUrl={pagePresenter.directoryMissingWebsiteUrlVm}
				overview={pagePresenter.directoryOverviewVm}
				historyChartSeries={pagePresenter.directoryHistoryChartSeriesVm}
				historyCompareOptions={pagePresenter.directoryHistoryCompareOptionsVm}
				historyWindowDays={pagePresenter.directoryHistoryWindowDays}
				canRefreshRatings={pagePresenter.directoryCanRefreshRatingsVm}
				refreshButtonHint={pagePresenter.directoryRefreshButtonHintVm}
				manualRefreshBlocked={pagePresenter.directoryManualRefreshBlockedVm}
				onHistoryWindowDaysChange={(days) => {
					pagePresenter.directoryHistoryWindowDays = days;
				}}
				onToggleHistoryCompareCompetitor={(domain) =>
					pagePresenter.toggleDirectoryHistoryChartCompetitor(domain)}
				competitorCap={pagePresenter.directoryCompetitorCap}
				refreshing={pagePresenter.directorySeoRefreshing}
				competitorDomain={pagePresenter.competitorDomainDraft}
				competitorLabel={pagePresenter.competitorLabelDraft}
				addingCompetitor={pagePresenter.directoryCompetitorAdding}
				onSelectProfile={(profileId) => pagePresenter.selectDirectoryProfile(profileId)}
				onRefresh={() => void pagePresenter.refreshDirectoryAnalytics(workspaceId)}
				onCompetitorDomainChange={(value) => (pagePresenter.competitorDomainDraft = value)}
				onCompetitorLabelChange={(value) => (pagePresenter.competitorLabelDraft = value)}
				onAddCompetitor={() => void pagePresenter.addDirectoryCompetitor(workspaceId)}
				onRemoveCompetitor={(domain) =>
					void pagePresenter.removeDirectoryCompetitor(workspaceId, domain)}
				competitorLabelSavingDomain={pagePresenter.directoryCompetitorLabelSavingDomain}
				onUpdateCompetitorLabel={(domain, label) =>
					void pagePresenter.updateDirectoryCompetitorLabel(workspaceId, domain, label)}
				billingHref={accountBillingHref}
				createProfileHref={directoryCreateProfileHref}
				editProfileWebsiteHref={directoryEditProfileWebsiteHref}
			/>
		{/if}
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
					Targeted channels
				</h3>
				<div class="flex flex-wrap items-center justify-end gap-2">
					<ChannelKindFilter
						channels={connectedChannelsVm}
						allSocialPlatforms={pagePresenter.platformFilterVm.allSocialPlatforms}
						selectedSocialPlatformIdentifiers={
							pagePresenter.platformFilterVm.selectedSocialPlatformIdentifiers
						}
						onChange={(next) => (pagePresenter.platformFilterVm = next)}
					/>

					<div class="w-[200px]">
						<Select type="single" value={String(dateWindowDays)} onValueChange={(v) => (dateWindowDays = Number(v))}>
							<SelectTrigger class="border-base-300 bg-base-100/60">
								<span class="text-sm">{dateWindowDays} Days</span>
							</SelectTrigger>
							<SelectContent>
								{#each allowedDateWindowDays as windowDays (windowDays)}
									<SelectItem value={String(windowDays)}>{windowDays} Days</SelectItem>
								{/each}
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
								continueSetupHref={(i) => pagePresenter.continueSetupHref(i)}
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
			{#if !pagePresenter.loading && !pagePresenter.error && pagePresenter.mergedSeriesVm.length > 0}
				<AnalyticsOverviewPanel
					seriesVm={pagePresenter.mergedSeriesVm}
				/>
			{/if}
			<RenderAnalyticsGrid
				integrationVm={filteredIntegrationsVm}
				loading={pagePresenter.loading}
				error={pagePresenter.error}
				seriesVm={pagePresenter.mergedSeriesVm}
				totals={pagePresenter.mergedTotalsVm}
				onRefreshIntegration={handleRefreshIntegration}
			/>
		</section>
	{/if}
</div>
