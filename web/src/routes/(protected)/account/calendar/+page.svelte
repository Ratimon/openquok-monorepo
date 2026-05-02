<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	// --- App / routing ---
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';

	// --- Area presenters ---
	import {
		getRootPathAccount,
		protectedCalendarPagePresenter,
		protectedDashboardPagePresenter
	} from '$lib/area-protected';
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
	import ShowPostActionsModal from '$lib/ui/components/posts/ShowPostActionsModal.svelte';
	import MoveChannelGroupModal from '$lib/ui/components/posts/MoveChannelGroupModal.svelte';
	import TimeTable from '$lib/ui/components/posts/TimeTable.svelte';

	const calendarPresenter = protectedCalendarPagePresenter;

	/** Same singleton as calendar presenter; `bind:presenter` cannot target an import binding. */
	let createPostPresenter = $state.raw(calendarPresenter.createSocialPostPresenter);

	// --- Modal / sheet open state ---
	let createSocialPostOpen = $state(false);

	let moveGroupOpen = $state(false);
	let moveGroupFor = $state<CreateSocialPostChannelViewModel | null>(null);

	let timeTableOpen = $state(false);
	let timeTableFor = $state<CreateSocialPostChannelViewModel | null>(null);

	let actionsOpen = $state(false);
	let actionsPostGroup = $state<string | null>(null);
	let actionsBusy = $state(false);

	// --- Routes & workspace ---
	const accountRoot = route(getRootPathAccount());
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const connectedChannelsVm = $derived(protectedDashboardPagePresenter.connectedChannelsVm);
	const listStatus = $derived(protectedDashboardPagePresenter.listStatus);
	const channelsLoadPending = $derived(listStatus === 'idle' || listStatus === 'loading');

	const targetedChannelsVm = $derived(calendarPresenter.targetedChannelsVm);
	const calendarRefreshKey = $derived(calendarPresenter.calendarRefreshKey);

	const groupId = $derived(page.url.searchParams.get('groupId'));

	// --- Navigation & composer ---
	function goBackToAccount() {
		void goto(accountRoot);
	}

	function openCreatePostForCurrentScope() {
		openCreatePostForCurrentScopeAtIso(null);
	}

	function openCreatePostForCurrentScopeAtIso(preselectScheduledAtIso: string | null) {
		const resultVm = calendarPresenter.getCreatePostPrepareOpenOptions();
		if (!resultVm.ok) {
			toast.error(resultVm.error);
			return;
		}
		calendarPresenter.createSocialPostPresenter.prepareOpen({
			...resultVm.options,
			preselectScheduledAtIso
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
			const id = resultVm.data.posts?.[0]?.id;
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
	function openActionsForPostGroup(postGroup: string) {
		if (!postGroup) return;
		actionsPostGroup = postGroup;
		actionsOpen = true;
	}

	function closeActions() {
		actionsOpen = false;
		actionsPostGroup = null;
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
		<h3 class="text-lg font-semibold text-base-content">Scheduled posts</h3>
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
			<p class="text-sm text-base-content/70">Connect at least one channel to view the calendar.</p>
		{/if}
	</section>
</div>

<ShowPostActionsModal
	open={actionsOpen}
	postGroup={actionsPostGroup}
	busy={actionsBusy}
	channels={connectedChannelsVm}
	loadPostGroup={(pg) => calendarPresenter.schedulerPresenter.getPostGroup(pg)}
	onClose={closeActions}
	onEdit={openEditPostGroup}
	onDuplicate={duplicatePostGroup}
	onCopy={copyPostGroupText}
	onDelete={deletePostGroup}
	onPreview={() => void previewPostGroup()}
	onStatistics={() => toast.message('Statistics is coming soon.')}
/>

<CreateSocialPostModal
	bind:open={createSocialPostOpen}
	bind:presenter={createPostPresenter}
	workspaceId={workspaceId}
	connectedChannels={connectedChannelsVm}
	uploadUid={workspaceId ?? ''}
	onScheduled={() => calendarPresenter.bumpCalendarRefresh()}
/>

<MoveChannelGroupModal bind:open={moveGroupOpen} integration={moveGroupFor} />

<TimeTable bind:open={timeTableOpen} integration={timeTableFor} />
