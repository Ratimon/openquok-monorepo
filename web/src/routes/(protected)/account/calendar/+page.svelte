<script lang="ts">
	import type { IconName } from '$data/icon';
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { page } from '$app/state';
	import { toast } from '$lib/ui/sonner';
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';
	
	import { getRootPathAccount } from '$lib/area-protected';
	import { protectedDashboardPagePresenter } from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { createSocialPostPresenter } from '$lib/posts';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	
	import Scheduler from '$lib/ui/components/calendar-scheduler/Scheduler.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';
	import MoveChannelGroupModal from '$lib/ui/components/posts/MoveChannelGroupModal.svelte';
	import TimeTable from '$lib/ui/components/posts/TimeTable.svelte';

	/** Same singleton as the module export; `bind:presenter` cannot target an import binding. */
	let createPostPresenter = $state.raw(createSocialPostPresenter);
	let createSocialPostOpen = $state(false);

	let calendarRefreshKey = $state(0);

	let targetedChannelsVm = $state<CreateSocialPostChannelViewModel[]>([]);

	let moveGroupOpen = $state(false);
	let moveGroupFor = $state<CreateSocialPostChannelViewModel | null>(null);

	let timeTableOpen = $state(false);
	let timeTableFor = $state<CreateSocialPostChannelViewModel | null>(null);

	const accountRoot = route(getRootPathAccount());
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const connectedChannelsVm = $derived(protectedDashboardPagePresenter.connectedChannelsVm);
	const listStatus = $derived(protectedDashboardPagePresenter.listStatus);
	const channelsLoadPending = $derived(listStatus === 'idle' || listStatus === 'loading');

	const groupId = $derived(page.url.searchParams.get('groupId'));

	const iconByProvider: Record<string, IconName> = {
		facebook: icons.Facebook.name,
		instagram: icons.Instagram.name,
		'instagram-business': icons.Instagram.name,
		'instagram-standalone': icons.InstagramGlyph.name,
		youtube: icons.YouTube.name,
		tiktok: icons.TikTok.name,
		x: icons.X.name,
		threads: icons.Threads.name
	};

	function providerIcon(identifier: string): IconName {
		return iconByProvider[identifier] ?? icons.Link.name;
	}

	function continueSetupHref(integration: CreateSocialPostChannelViewModel): string {
		if (!workspaceId) return accountRoot;
		if (integration.identifier === 'instagram-business') {
			const qs = new URLSearchParams({
				organizationId: workspaceId,
				integrationId: integration.id,
				returnTo: accountRoot
			});
			return `${accountRoot}/integrations/instagram-business?${qs}`;
		}
		const qs = new URLSearchParams({
			organizationId: workspaceId,
			returnTo: accountRoot,
			refresh: integration.internalId
		});
		return `${accountRoot}/integrations/social/${encodeURIComponent(integration.identifier)}?${qs}`;
	}

	function goBackToAccount() {
		void goto(accountRoot);
	}

	function openCreatePostForCurrentScope() {
		if (!workspaceId) {
			toast.error('Create or select a workspace first.');
			return;
		}
		const ids = targetedChannelsVm.map((c) => c.id);
		const isAllTargeted = targetedChannelsVm.length > 0 && targetedChannelsVm.length === connectedChannelsVm.length;
		const uniqueGroupIds = new Set(
			targetedChannelsVm.map((c) => c.group?.id ?? null).filter((g): g is string => Boolean(g))
		);
		const hasUngrouped = targetedChannelsVm.some((c) => !c.group?.id);
		const singleGroupId = !hasUngrouped && uniqueGroupIds.size === 1 ? [...uniqueGroupIds][0]! : null;
		createSocialPostPresenter.prepareOpen({
			preselectIntegrationId: null,
			preselectGroupId: singleGroupId,
			preselectIntegrationIds: singleGroupId ? null : ids.length ? ids : null,
			// If the user is targeting everything (All groups), keep the composer in default global mode.
			autoCustomizeFirstSelected: !isAllTargeted
		});
		createSocialPostOpen = true;
	}

	function openTimeTableModal(integration: CreateSocialPostChannelViewModel) {
		timeTableFor = integration;
		timeTableOpen = true;
	}

	function openMoveGroupModal(integration: CreateSocialPostChannelViewModel) {
		moveGroupFor = integration;
		moveGroupOpen = true;
	}

	async function handleRemoveChannel(id: string): Promise<boolean> {
		const r = await protectedDashboardPagePresenter.removeChannel(id);
		if (r.ok) {
			toast.success('Channel removed.');
			calendarRefreshKey += 1;
			return true;
		}
		toast.error(r.error);
		return false;
	}

	async function handleSetChannelDisabled(id: string, disabled: boolean): Promise<boolean> {
		const r = await protectedDashboardPagePresenter.setChannelDisabled(id, disabled);
		if (r.ok) {
			toast.success(disabled ? 'Channel disabled.' : 'Channel enabled.');
			calendarRefreshKey += 1;
			return true;
		}
		toast.error(r.error);
		return false;
	}

	$effect(() => {
		if (!moveGroupOpen) {
			moveGroupFor = null;
		}
	});

	$effect(() => {
		if (!timeTableOpen) {
			timeTableFor = null;
		}
	});

	$effect(() => {
		const orgId = workspaceId;
		if (!orgId) return;
		void protectedDashboardPagePresenter.loadDashboardLists();
	});
</script>

<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="space-y-1">
			<h2 class="text-2xl font-bold text-base-content">Calendar</h2>
			<p class="text-base-content/70 text-sm">View and manage scheduled posts for this workspace.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button
				type="button"
				variant="secondary"
				disabled={!workspaceId}
				onclick={openCreatePostForCurrentScope}
				class="shrink-0"
			>
				<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
				Create Post
			</Button>
			<Button type="button" variant="outline" onclick={goBackToAccount}>
				<AbstractIcon name={icons.ArrowLeft.name} class="size-4" width="16" height="16" />
				Back to dashboard
			</Button>
		</div>
	</div>

	<section class="space-y-3">
		<div class="flex items-center justify-between gap-3">
			<h3 class="text-lg font-semibold text-base-content">
				Targeted channels
			</h3>
		</div>

		{#if !workspaceId}
			<p class="text-sm text-base-content/70">Select or create a workspace to load channels.</p>
		{:else if channelsLoadPending}
			<p class="flex items-center gap-2 text-sm text-base-content/70">
				<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
				Loading channels…
			</p>
		{:else if listStatus === 'error'}
			<p class="text-sm text-error">Could not load channels. Try again in a moment.</p>
		{:else if connectedChannelsVm.length === 0}
			<p class="text-sm text-base-content/70">No channels yet. Go back and use Add Channel to connect one.</p>
		{:else if targetedChannelsVm.length === 0}
			<p class="text-sm text-base-content/70">No channels match the current filter.</p>
		{:else}
			<ul class="flex list-none flex-row flex-wrap items-center gap-2 p-0">
				{#each targetedChannelsVm as integration (integration.id)}
					<li class="min-w-0">
						<IntegrationMenu
							variant="chip"
							showProviderBadge={true}
							{integration}
							workspaceId={workspaceId}
							{providerIcon}
							{continueSetupHref}
							onMoveToGroup={openMoveGroupModal}
							onEditTimeSlots={openTimeTableModal}
							onSetDisabled={handleSetChannelDisabled}
							onRemove={handleRemoveChannel}
						/>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="space-y-3">
		<h3 class="text-lg font-semibold text-base-content">Scheduled posts</h3>
		{#if workspaceId && connectedChannelsVm.length > 0}
			<Scheduler
				organizationId={workspaceId}
				channels={connectedChannelsVm}
				groupId={groupId}
				refreshKey={calendarRefreshKey}
				onTargetedChannelsChange={(chs) => (targetedChannelsVm = chs)}
			/>
		{:else}
			<p class="text-sm text-base-content/70">Connect at least one channel to view the calendar.</p>
		{/if}
	</section>
</div>

<CreateSocialPostModal
	bind:open={createSocialPostOpen}
	bind:presenter={createPostPresenter}
	workspaceId={workspaceId}
	connectedChannels={connectedChannelsVm}
	uploadUid={workspaceId ?? ''}
	onScheduled={() => (calendarRefreshKey += 1)}
/>

<MoveChannelGroupModal bind:open={moveGroupOpen} integration={moveGroupFor} />

<TimeTable bind:open={timeTableOpen} integration={timeTableFor} />

