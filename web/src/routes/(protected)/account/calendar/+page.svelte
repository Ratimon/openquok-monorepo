<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { SetRowViewModel, SetSnapshotViewModel } from '$lib/sets';

	// --- App / routing ---
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';

	// --- Area presenters ---
	import {
		getRootPathAccount,
		protectedCalendarPagePresenter,
		protectedDashboardPagePresenter
	} from '$lib/area-protected';
	import { getSetPresenter } from '$lib/sets';
	import { workspaceSettingsPresenter } from '$lib/settings';

	// --- Feedback ---
	import { toast } from '$lib/ui/sonner';

	// --- Icons ---
	import { icons } from '$data/icons';

	// --- UI ---
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import Scheduler from '$lib/ui/components/calendar-scheduler/Scheduler.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';
	import SetPickerDialog from '$lib/ui/components/posts/SetPickerDialog.svelte';
	import ShowPostActionsModal from '$lib/ui/components/posts/ShowPostActionsModal.svelte';
	import MoveChannelGroupModal from '$lib/ui/components/posts/MoveChannelGroupModal.svelte';
	import TimeTable from '$lib/ui/components/posts/TimeTable.svelte';
	import StatisticsModal from '$lib/ui/components/platform-analytics/StatisticsModal.svelte';


	const calendarPresenter = protectedCalendarPagePresenter;

	// --- Modal / sheet open state ---
	let createSocialPostOpen = $state(false);

	let setPickOpen = $state(false);
	let setPickRowsVm = $state<SetRowViewModel[]>([]);
	let setPickFinish: ((v: SetSnapshotViewModel | null | undefined) => void) | null = null;

	let moveGroupOpen = $state(false);
	let moveGroupFor = $state<CreateSocialPostChannelViewModel | null>(null);

	let timeTableOpen = $state(false);
	let timeTableFor = $state<CreateSocialPostChannelViewModel | null>(null);

	let actionsOpen = $state(false);
	let actionsPostGroup = $state<string | null>(null);
	/** When set, Preview / Statistics target this row id inside the `post_group` (multi-channel). */
	let actionsFocusPostId = $state<string | null>(null);
	/** When set, Post actions header shows this channel only (avatar + per-channel body). */
	let actionsFocusIntegrationId = $state<string | null>(null);
	let actionsBusy = $state(false);

	let statisticsOpen = $state(false);
	let statisticsPostId = $state<string | null>(null);

	// --- Routes & workspace ---
	const accountRoot = route(getRootPathAccount());
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const connectedChannelsVm = $derived(protectedDashboardPagePresenter.connectedChannelsVm);
	const listStatus = $derived(protectedDashboardPagePresenter.listStatus);
	const channelsLoadPending = $derived(listStatus === 'idle' || listStatus === 'loading');

	const targetedChannelsVm = $derived(calendarPresenter.targetedChannelsVm);
	const calendarRefreshKey = $derived(calendarPresenter.calendarRefreshKey);

	/** Worker publishes update DB without bumping this key; refetch after tab focus (throttled). */
	let lastCalendarVisibilityBumpMs = 0;
	$effect(() => {
		if (!browser) return;
		const presenter = calendarPresenter;
		const onVisibility = () => {
			if (document.visibilityState !== 'visible') return;
			const now = Date.now();
			if (now - lastCalendarVisibilityBumpMs < 45_000) return;
			lastCalendarVisibilityBumpMs = now;
			presenter.bumpCalendarRefresh();
		};
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	});

	const groupId = $derived(page.url.searchParams.get('groupId'));

	// --- Navigation & composer ---
	function goBackToAccount() {
		void goto(accountRoot);
	}

	async function chooseSetSnapshotForWorkspace(): Promise<SetSnapshotViewModel | null | undefined> {
		const oid = workspaceId;
		if (!oid) return undefined;
		const rowsVm = await getSetPresenter.loadSetsListVm(oid);
		if (!rowsVm.length) return null;
		return new Promise((resolve) => {
			setPickRowsVm = rowsVm;
			setPickFinish = resolve;
			setPickOpen = true;
		});
	}

	function finishSetPick(value: SetSnapshotViewModel | null | undefined) {
		setPickOpen = false;
		setPickFinish?.(value);
		setPickFinish = null;
	}

	function handleSetPickRow(row: SetRowViewModel) {
		const snapshotVm = getSetPresenter.parseSnapshotFromContentStateless(row.content);
		if (!snapshotVm) {
			toast.error('This set could not be loaded.');
			return;
		}
		finishSetPick(snapshotVm);
	}

	async function openCreatePostForCurrentScope() {
		await openCreatePostForCurrentScopeAtIso(null);
	}

	async function openCreatePostForCurrentScopeAtIso(preselectScheduledAtIso: string | null) {
		const resultVm = calendarPresenter.getCreatePostPrepareOpenOptions();
		if (!resultVm.ok) {
			toast.error(resultVm.error);
			return;
		}
		const oid = workspaceId;
		if (!oid) return;
		const picked = await chooseSetSnapshotForWorkspace();
		if (picked === undefined) return;
		calendarPresenter.createSocialPostPresenter.prepareOpen({
			...resultVm.options,
			preselectScheduledAtIso,
			setSnapshot: picked ?? null
		});
		createSocialPostOpen = true;
	}

	function openEditPostGroup(postGroup: string) {
		if (!workspaceId) {
			toast.error('Select a workspace first.');
			return;
		}
		calendarPresenter.createSocialPostPresenter.prepareEdit(postGroup);
		createSocialPostOpen = true;
	}

	function duplicatePostGroup(postGroup: string) {
		if (!workspaceId) {
			toast.error('Select a workspace first.');
			return;
		}
		calendarPresenter.createSocialPostPresenter.prepareDuplicate(postGroup);
		createSocialPostOpen = true;
	}

	async function previewPostGroup(): Promise<void> {
		const pg = actionsPostGroup;
		if (!pg) return;
		actionsBusy = true;
		try {
			const resultVm = await calendarPresenter.schedulerPresenter.debugExportPostGroup(pg);
			if (!resultVm.ok) {
				toast.error(resultVm.error);
				return;
			}
			const focus = actionsFocusPostId?.trim() ?? '';
			const posts = resultVm.data.posts ?? [];
			const id =
				focus && posts.some((p) => p.id === focus)
					? focus
					: posts[0]?.id;
			if (!id) {
				toast.error('Could not preview this post.');
				return;
			}
			window.open(`/p/${id}?share=true`, '_blank');
		} finally {
			actionsBusy = false;
		}
	}

	// --- Post group actions modal ---
	function openActionsForPostGroup(postGroup: string, focusPostId?: string, focusIntegrationId?: string) {
		if (!postGroup) return;
		actionsPostGroup = postGroup;
		actionsFocusPostId = focusPostId?.trim() || null;
		actionsFocusIntegrationId = focusIntegrationId?.trim() || null;
		actionsOpen = true;
	}

	function closeActions() {
		actionsOpen = false;
		actionsPostGroup = null;
		actionsFocusPostId = null;
		actionsFocusIntegrationId = null;
		actionsBusy = false;
	}

	async function copyPostGroupText() {
		const pg = actionsPostGroup;
		if (!pg) return;
		actionsBusy = true;
		try {
			const resultVm = await calendarPresenter.schedulerPresenter.debugExportPostGroup(pg);
			if (!resultVm.ok) {
				toast.warning('Failed to copy debug data.');
				return;
			}
			await navigator.clipboard.writeText(JSON.stringify(resultVm.data, null, 2));
			toast.success('Debug JSON copied to clipboard.');
		} catch {
			toast.warning('Failed to copy debug data.');
		} finally {
			actionsBusy = false;
		}
	}

	async function deletePostGroup() {
		const pg = actionsPostGroup;
		if (!pg) return;
		const ok = confirm('Delete this post?');
		if (!ok) return;
		actionsBusy = true;
		try {
			const resultVm = await calendarPresenter.schedulerPresenter.deletePostGroup(pg);
			if (resultVm.ok) {
				toast.success('Post deleted.');
				calendarPresenter.bumpCalendarRefresh();
				closeActions();
				return;
			}
			toast.error(resultVm.error);
		} finally {
			actionsBusy = false;
		}
	}

	// --- Channel chips (IntegrationMenu) ---
	function openTimeTableModal(integration: CreateSocialPostChannelViewModel) {
		timeTableFor = integration;
		timeTableOpen = true;
	}

	function openMoveGroupModal(integration: CreateSocialPostChannelViewModel) {
		moveGroupFor = integration;
		moveGroupOpen = true;
	}

	async function handleRemoveChannel(id: string): Promise<boolean> {
		const resultVm = await calendarPresenter.removeChannel(id);
		if (resultVm.ok) {
			toast.success('Channel removed.');
			return true;
		}
		toast.error(resultVm.error);
		return false;
	}

	async function handleSetChannelDisabled(id: string, disabled: boolean): Promise<boolean> {
		const resultVm = await calendarPresenter.setChannelDisabled(id, disabled);
		if (resultVm.ok) {
			toast.success(disabled ? 'Channel disabled.' : 'Channel enabled.');
			return true;
		}
		toast.error(resultVm.error);
		return false;
	}

	// --- Effects: reset modal payloads; load integrations when workspace is set ---
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
		calendarPresenter.syncWorkspaceDashboardLists();
	});
</script>

<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="space-y-1">
			<div class="flex items-center gap-3">
				<AbstractIcon
					name={icons.CalendarClock.name}
					class="text-primary size-8 shrink-0"
					width="32"
					height="32"
				/>
				<h1 class="text-2xl font-bold text-base-content">
					Calendar
				</h1>
			</div>
			<p class="text-base-content/70 text-sm">
				View and manage scheduled posts for this workspace.</p>
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
			<p class="text-sm text-base-content/70">
				Select or create a workspace to load channels.
			</p>
		{:else if channelsLoadPending}
			<p class="flex items-center gap-2 text-sm text-base-content/70">
				<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
				Loading channels…
			</p>
		{:else if listStatus === 'error'}
			<p class="text-sm text-error">
				Could not load channels. Try again in a moment.
			</p>
		{:else if connectedChannelsVm.length === 0}
			<p class="text-sm text-base-content/70">
				No channels yet. Go back and use Add Channel to connect one.
			</p>
		{:else if targetedChannelsVm.length === 0}
			<p class="text-sm text-base-content/70">
				No channels match the current filter.
			</p>
		{:else}
			<ul class="flex list-none flex-row flex-wrap items-center gap-2 p-0">
				{#each targetedChannelsVm as integration (integration.id)}
					<li class="min-w-0">
						<IntegrationMenu
							variant="chip"
							showProviderBadge={true}
							{integration}
							workspaceId={workspaceId}
							providerIcon={(id: string) => calendarPresenter.providerIcon(id)}
							continueSetupHref={(i: CreateSocialPostChannelViewModel) =>
								calendarPresenter.continueSetupHref(i)}
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
		<h3 class="text-lg font-semibold text-base-content">
			Scheduled posts</h3>
		{#if workspaceId && connectedChannelsVm.length > 0}
			<Scheduler
				presenter={calendarPresenter.schedulerPresenter}
				organizationId={workspaceId}
				channels={connectedChannelsVm}
				groupId={groupId}
				refreshKey={calendarRefreshKey}
				onTargetedChannelsChange={(chs) => calendarPresenter.setTargetedChannels(chs)}
				onEditPostGroup={openEditPostGroup}
				openActionsForPostGroup={openActionsForPostGroup}
				onCreatePostAtIso={(iso) => openCreatePostForCurrentScopeAtIso(iso)}
				onRefresh={() => calendarPresenter.bumpCalendarRefresh()}
			/>
		{:else}
			<p class="text-sm text-base-content/70">
				Connect at least one channel to view the calendar.</p>
		{/if}
	</section>
</div>

<ShowPostActionsModal
	open={actionsOpen}
	postGroup={actionsPostGroup}
	focusPostId={actionsFocusPostId}
	focusIntegrationId={actionsFocusIntegrationId}
	busy={actionsBusy}
	channels={connectedChannelsVm}
	loadPostGroup={(pg) => calendarPresenter.schedulerPresenter.getPostGroup(pg)}
	onClose={closeActions}
	onEdit={openEditPostGroup}
	onDuplicate={duplicatePostGroup}
	onCopy={copyPostGroupText}
	onDelete={deletePostGroup}
	onPreview={() => void previewPostGroup()}
	onStatistics={(postId) => {
		statisticsPostId = postId;
		statisticsOpen = true;
	}}
/>

<StatisticsModal
	bind:open={statisticsOpen}
	postId={statisticsPostId}
	organizationId={workspaceId}
	loadPostAnalytics={(p) => calendarPresenter.loadPostStatisticsAnalyticsVm(p)}
	loadMissingCandidates={(p) => calendarPresenter.loadMissingPublishCandidatesForPost(p)}
	updatePostRelease={(p) => calendarPresenter.updatePostReleaseIdForStatistics(p)}
	onClose={() => {
		statisticsPostId = null;
	}}
/>

<CreateSocialPostModal
	bind:open={createSocialPostOpen}
	bind:presenter={calendarPresenter.createSocialPostPresenter}
	workspaceId={workspaceId}
	connectedChannels={connectedChannelsVm}
	uploadUid={workspaceId ?? ''}
	onScheduled={() => calendarPresenter.bumpCalendarRefresh()}
/>

<SetPickerDialog
	bind:open={setPickOpen}
	setsVm={setPickRowsVm}
	onPick={handleSetPickRow}
	onContinueWithout={() => finishSetPick(null)}
	onDismiss={() => finishSetPick(undefined)}
/>

<MoveChannelGroupModal bind:open={moveGroupOpen} integration={moveGroupFor} />

<TimeTable bind:open={timeTableOpen} integration={timeTableFor} />
