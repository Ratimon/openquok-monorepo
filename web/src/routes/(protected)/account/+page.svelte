<script lang="ts">
	import type { PageData } from './$types';
	import type { CreateSocialPostChannelViewModel } from '$lib/channels';
	import type { ChannelsGridActions } from '$lib/ui/components/channels/channelsGridContext';
	import type { SetRowViewModel, SetSnapshotViewModel } from '$lib/sets';

	// --- App / routing ---
	import { browser } from '$app/environment';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { absoluteUrl, route, url } from '$lib/utils/path';

	// --- Area & integrations ---
	import {
		getRootPathAccount,
		getRootPathCalendar,
		protectedCalendarPagePresenter,
		protectedHomePagePresenter,
		protectedSettingsPagePresenter,
		WorkspaceSettingsStatus
	} from '$lib/area-protected';
	import { getSetPresenter } from '$lib/sets';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import { firstBillingGatePresenter, tierDisplayName } from '$lib/billing';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { buildAccountSettingsSearchParams } from '$lib/settings/utils/buildAccountSettingsSearch';

	// --- Feedback ---
	import { fireProductEvent } from '$lib/product-analytics';
	import { toast } from '$lib/ui/sonner';

	// --- Data / icons ---
	import { icons } from '$data/icons';
	// --- UI ---
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';
	import SetPickerDialog from '$lib/ui/components/posts/SetPickerDialog.svelte';
	import MoveChannelGroupModal from '$lib/ui/components/posts/MoveChannelGroupModal.svelte';
	import OnBoardingModal from '$lib/ui/components/posts/OnBoardingModal.svelte';
	import TimeTable from '$lib/ui/components/posts/TimeTable.svelte';
	import ShowChannelActionsModal from '$lib/ui/components/posts/ShowChannelActionsModal.svelte';
	import ShowPostActionsModal from '$lib/ui/components/posts/ShowPostActionsModal.svelte';
	import DeleteModal from '$lib/ui/modals/DeleteModal.svelte';
	import PostKanbanBoard from '$lib/ui/components/kanban-board/PostKanbanBoard.svelte';
	import HomeAccountNoticeBanner from '$lib/ui/components/home/HomeAccountNoticeBanner.svelte';
	import MyChannelsSection from '$lib/ui/components/channels/MyChannelsSection.svelte';
	import MyWorkspacesSection from '$lib/ui/components/workspaces/MyWorkspacesSection.svelte';
	import { postsLimitKey, type PostsLimitContext } from '$lib/ui/components/posts/postsLimitContext';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	// /account/calendar
	const rootPathCalendar = getRootPathCalendar();
	const calendarPath = route(`${rootPathAccount}/${rootPathCalendar}`);

	const pagePresenter = protectedHomePagePresenter;
	const postKanbanBoard = pagePresenter.postKanbanBoardPresenter;
	const channelsGridPresenter = pagePresenter.channelsGridTable;
	const channelsFilterPresenter = pagePresenter.channelsGridFilterBuilder;

	/** Stable ref for composer `bind:` chain (`pagePresenter.createSocialPostPresenter`). */
	let createSocialPostModalPresenter = $state.raw(pagePresenter.createSocialPostPresenter);

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const postsLimitCtx = getContext<PostsLimitContext>(postsLimitKey);

	// --- Layout data ---
	let currentUser = $derived((data as App.LayoutData)?.currentUser ?? (page.data as App.LayoutData)?.currentUser ?? null);

	// --- Workspace + home VMs ---
	const accountRoot = $derived(accountPath);
	const accountSettingsWorkspaceHref = $derived(url(`${accountRoot}/settings?section=workspace`));
	const accountSettingsDeveloperOAuthHref = $derived(
		url(`${accountRoot}/settings?${buildAccountSettingsSearchParams('developers', { developerTab: 'apps' })}`)
	);
	const accountSettingsDeveloperApiKeyHref = $derived(
		url(`${accountRoot}/settings?${buildAccountSettingsSearchParams('developers')}`)
	);
	const accountSettingsTeamHref = $derived(url(`${accountRoot}/settings?section=workspace`));
	const accountBillingHref = $derived(url(`${accountRoot}/billing`));
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	$effect(() => {
		void postKanbanBoard.load(workspaceId);
	});

	const listStatus = $derived(protectedHomePagePresenter.listStatus);
	const channelGroupSectionsVm = $derived(protectedHomePagePresenter.channelGroupSectionsVm);
	const platformChannelRowsUngroupedVm = $derived(
		protectedHomePagePresenter.platformChannelRowsUngroupedVm
	);
	const connectedChannelsVm = $derived(protectedHomePagePresenter.connectedChannelsVm);

	$effect(() => {
		const orgId = workspaceId;
		if (!orgId || listStatus !== 'ready') return;
		postKanbanBoard.setChannels(orgId, connectedChannelsVm);
	});

	$effect(() => {
		const orgId = workspaceId;
		if (!orgId) return;
		void createSocialPostModalPresenter.loadWorkspaceTagsIfNeeded(orgId);
	});

	const postKanbanColumnsVm = $derived(postKanbanBoard.columnsVm);
	const postKanbanColumnCountsVm = $derived(postKanbanBoard.columnCountsVm);
	const postKanbanColumnOptions = $derived(postKanbanBoard.columnOptions);
	const postKanbanSourceFilterOptions = $derived(postKanbanBoard.sourceFilterOptions);
	const postKanbanTimeFilterOptions = $derived(postKanbanBoard.timeFilterOptions);
	const postKanbanSourceFilter = $derived(postKanbanBoard.sourceFilter);
	const postKanbanTimeFilter = $derived(postKanbanBoard.timeFilter);
	const postKanbanAllGroups = $derived(postKanbanBoard.allGroups);
	const postKanbanSelectedGroupIds = $derived(postKanbanBoard.selectedGroupIds);
	const postKanbanAllSocialPlatforms = $derived(postKanbanBoard.allSocialPlatforms);
	const postKanbanSelectedSocialPlatformIdentifiers = $derived(
		postKanbanBoard.selectedSocialPlatformIdentifiers
	);
	const postKanbanAllTags = $derived(postKanbanBoard.allTags);
	const postKanbanSelectedTagNames = $derived(postKanbanBoard.selectedTagNames);
	const workspaceTagsVm = $derived(createSocialPostModalPresenter.tagsVm);
	const postKanbanPostsForTagFilter = $derived(postKanbanBoard.postsForChannelLookup);
	$effect(() => {
		postKanbanBoard.populateAllTagSelectionWhenEmpty(workspaceTagsVm, postKanbanPostsForTagFilter);
	});
	const postKanbanStatus = $derived(postKanbanBoard.status);
	const postKanbanError = $derived(postKanbanBoard.error);
	const postKanbanMovingPostGroup = $derived(postKanbanBoard.movingPostGroup);
	const connectedChannelCountVm = $derived(connectedChannelsVm.length);
	const myWorkspacesCardsVm = $derived(pagePresenter.myWorkspacesCardsVm);
	const myWorkspacesStatus = $derived(pagePresenter.myWorkspacesStatus);
	const workspacesVm = $derived(workspaceSettingsPresenter.workspacesVm);
	const myWorkspacesTotalCount = $derived(workspacesVm.length);
	const currentWorkspaceCardVm = $derived(myWorkspacesCardsVm.find((c) => c.isCurrent) ?? null);
	const currentWorkspaceMemberCountVm = $derived(currentWorkspaceCardVm?.memberCount ?? 0);
	const subscriptionTierVm = $derived(
		firstBillingGatePresenter.pricingVm?.currentVm?.subscription?.tier ??
			firstBillingGatePresenter.pricingVm?.currentVm?.tier ??
			null
	);
	const allowedWorkspaceCountVm = $derived(
		firstBillingGatePresenter.pricingVm?.currentVm?.limits?.workspaces ?? null
	);
	const allowedChannelCountVm = $derived(
		firstBillingGatePresenter.pricingVm?.currentVm?.limits?.channelPerWorkspace ?? null
	);
	const postsUsedThisMonthVm = $derived(
		firstBillingGatePresenter.pricingVm?.currentVm?.posts?.used ?? 0
	);
	const allowedPostsPerMonthVm = $derived(
		firstBillingGatePresenter.pricingVm?.currentVm?.posts?.limit ?? null
	);
	const isSoloPlanVm = $derived(subscriptionTierVm === 'SOLO');
	const currentPlanLabel = $derived(tierDisplayName(subscriptionTierVm ?? 'FREE'));
	const creatingWorkspace = $derived(
		workspaceSettingsPresenter.status === WorkspaceSettingsStatus.CREATING
	);
	const currentWorkspaceSocialChannelCount = $derived.by(() => {
		if (myWorkspacesStatus === 'ready') {
			const current = myWorkspacesCardsVm.find((c) => c.isCurrent);
			if (current) return current.socialChannelCount;
		}
		return connectedChannelsVm.filter((c) => (c.type ?? '').toLowerCase() === 'social').length;
	});
	const showPostKanbanBoard = $derived(
		Boolean(workspaceId) && currentWorkspaceSocialChannelCount > 0
	);
	let channelActionsOpen = $state(false);
	let channelActionsFor = $state<CreateSocialPostChannelViewModel | null>(null);

	// --- Modal open state ---
	let moveGroupOpen = $state(false);
	let moveGroupFor = $state<CreateSocialPostChannelViewModel | null>(null);

	let timeTableOpen = $state(false);
	let timeTableForVm = $state<CreateSocialPostChannelViewModel | null>(null);

	let createSocialPostOpen = $state(false);

	let kanbanActionsOpen = $state(false);
	let kanbanActionsPostGroup = $state<string | null>(null);
	let kanbanActionsFocusPostId = $state<string | null>(null);
	let kanbanActionsBusy = $state(false);
	let kanbanDeleteConfirmOpen = $state(false);

	let setPickOpen = $state(false);
	let setPickRowsVm = $state<SetRowViewModel[]>([]);
	let setPickFinish: ((v: SetSnapshotViewModel | null | undefined) => void) | null = null;

	async function chooseSetSnapshotForWorkspace(): Promise<SetSnapshotViewModel | null | undefined> {
		const oid = workspaceId;
		if (!oid) return undefined;
		const rows = await getSetPresenter.loadSetsListVm(oid);
		if (!rows.length) return null;
		return new Promise((resolve) => {
			setPickRowsVm = rows;
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
		const snap = getSetPresenter.parseSnapshotFromContentStateless(row.content);
		if (!snap) {
			toast.error('This set could not be loaded.');
			return;
		}
		finishSetPick(snap);
	}

	// --- Composer & navigation ---
	async function openCreatePost(preselectIntegrationId: string | null) {
		postsLimitCtx.tryCreatePost(async () => {
			const oid = workspaceId;
			if (!oid) {
				toast.error('Create or select a workspace first.');
				return;
			}
			const picked = await chooseSetSnapshotForWorkspace();
			if (picked === undefined) return;
			createSocialPostModalPresenter.prepareOpen({
				preselectIntegrationId,
				preselectGroupId: null,
				setSnapshot: picked ?? null
			});
			createSocialPostOpen = true;
		});
	}

	async function openCreatePostForGroup(groupId: string) {
		postsLimitCtx.tryCreatePost(async () => {
			const oid = workspaceId;
			if (!oid) {
				toast.error('Create or select a workspace first.');
				return;
			}
			const picked = await chooseSetSnapshotForWorkspace();
			if (picked === undefined) return;
			createSocialPostModalPresenter.prepareOpen({
				preselectIntegrationId: null,
				preselectGroupId: groupId,
				autoCustomizeFirstSelected: true,
				setSnapshot: picked ?? null
			});
			createSocialPostOpen = true;
		});
	}

	function openKanbanPostActions(payload: { postGroup: string; postId: string }) {
		kanbanActionsPostGroup = payload.postGroup;
		kanbanActionsFocusPostId = payload.postId;
		kanbanActionsOpen = true;
	}

	function closeKanbanPostActions() {
		kanbanActionsOpen = false;
		kanbanActionsPostGroup = null;
		kanbanActionsFocusPostId = null;
		kanbanActionsBusy = false;
		kanbanDeleteConfirmOpen = false;
	}

	async function handleKanbanMoveCardToColumn(
		payload: Parameters<typeof postKanbanBoard.moveCardToColumn>[0],
		column: Parameters<typeof postKanbanBoard.moveCardToColumn>[1]
	) {
		const usageDelta = postKanbanBoard.postsUsageDeltaForMove(payload, column);
		if (usageDelta) {
			postsLimitCtx.adjustPostsUsedThisMonth(usageDelta);
		}
		const result = await postKanbanBoard.moveCardToColumn(payload, column);
		if (!result.ok && usageDelta) {
			postsLimitCtx.adjustPostsUsedThisMonth(-usageDelta);
		}
		return result;
	}

	function handleComposerScheduled() {
		void postKanbanBoard.refresh();
		if (!createSocialPostModalPresenter.editingPostGroup) {
			const rowCount = createSocialPostModalPresenter.selectedIds.length;
			if (rowCount > 0) {
				postsLimitCtx.adjustPostsUsedThisMonth(rowCount);
			}
		}
	}

	function handleComposerDraftSaved() {
		void postKanbanBoard.refresh();
	}

	function openEditKanbanPostGroup(postGroup: string) {
		if (!workspaceId) {
			toast.error('Create or select a workspace first.');
			return;
		}
		createSocialPostModalPresenter.prepareEdit(postGroup);
		createSocialPostOpen = true;
	}

	function duplicateKanbanPostGroup(postGroup: string) {
		if (!workspaceId) {
			toast.error('Create or select a workspace first.');
			return;
		}
		createSocialPostModalPresenter.prepareDuplicate(postGroup);
		createSocialPostOpen = true;
	}

	async function copyKanbanPostGroupText() {
		const pg = kanbanActionsPostGroup;
		if (!pg) return;
		kanbanActionsBusy = true;
		try {
			const resultVm = await postKanbanBoard.loadPostGroupJson(pg);
			if (!resultVm.ok) {
				toast.warning('Failed to copy post data.');
				return;
			}
			await navigator.clipboard.writeText(resultVm.json);
			toast.success('Post JSON copied to clipboard.');
		} catch {
			toast.warning('Failed to copy post data.');
		} finally {
			kanbanActionsBusy = false;
		}
	}

	function requestDeleteKanbanPostGroup() {
		if (!kanbanActionsPostGroup) return;
		kanbanDeleteConfirmOpen = true;
	}

	async function confirmDeleteKanbanPostGroup() {
		const pg = kanbanActionsPostGroup;
		if (!pg) return;
		kanbanDeleteConfirmOpen = false;
		kanbanActionsBusy = true;
		try {
			const resultVm = await postKanbanBoard.deletePostGroup(pg);
			if (resultVm.ok) {
				toast.success('Post deleted.');
				protectedCalendarPagePresenter.bumpCalendarRefresh();
				closeKanbanPostActions();
				return;
			}
			toast.error(resultVm.error);
		} finally {
			kanbanActionsBusy = false;
		}
	}

	async function previewKanbanPostGroup() {
		const id = kanbanActionsFocusPostId?.trim();
		if (!id) {
			toast.error('Could not preview this post.');
			return;
		}
		window.open(`/p/${id}?share=true`, '_blank');
	}

	function goToCalendar(groupId: string | null) {
		if (!workspaceId) {
			toast.error('Create or select a workspace first.');
			return;
		}
		const qs = groupId ? `?groupId=${encodeURIComponent(groupId)}` : '';
		void goto(`${accountRoot}/calendar${qs}`);
	}

	function openMoveGroupModal(integration: CreateSocialPostChannelViewModel) {
		moveGroupFor = integration;
		moveGroupOpen = true;
	}

	function openTimeTableModal(integration: CreateSocialPostChannelViewModel) {
		timeTableForVm = integration;
		timeTableOpen = true;
	}

	// --- Effects: modal cleanup ---
	$effect(() => {
		if (!moveGroupOpen) {
			moveGroupFor = null;
		}
	});

	$effect(() => {
		if (!timeTableOpen) {
			timeTableForVm = null;
		}
	});

	$effect(() => {
		if (!channelActionsOpen) {
			channelActionsFor = null;
		}
	});

	/**
	 * Onboarding: dismissible home notices (no channels, solo upgrade, invite team) plus
	 * `OnBoardingModal` auto-open on first empty workspace when `onboarding:completed` is unset.
	 *
	 * Preview modal: delete `onboarding:completed` in DevTools, reload with zero channels.
	 * Preview notices: delete `home:notice:*` keys for the workspace id in localStorage.
	 */
	let onboardingDialogOpen = $state(false);
	let prevOnboardingWelcome = $state(false);
	let hasAutoOpenedOnboarding = $state(false);
	let noChannelsNoticeDismissed = $state(false);
	let inviteTeamNoticeDismissed = $state(false);
	let soloUpgradeNoticeDismissed = $state(false);

	const HOME_NOTICE_STORAGE_PREFIX = 'home:notice';

	function homeNoticeStorageKey(kind: string, orgId: string): string {
		return `${HOME_NOTICE_STORAGE_PREFIX}:${kind}:${orgId}`;
	}

	function readHomeNoticeDismissed(kind: string, orgId: string | null): boolean {
		if (!browser || !orgId) return false;
		try {
			return localStorage.getItem(homeNoticeStorageKey(kind, orgId)) === 'true';
		} catch {
			return false;
		}
	}

	function persistHomeNoticeDismissed(kind: string, orgId: string): void {
		if (!browser) return;
		try {
			localStorage.setItem(homeNoticeStorageKey(kind, orgId), 'true');
		} catch {
			// ignore
		}
	}

	function isOnboardingCompleted(): boolean {
		if (!browser) return false;
		try {
			return localStorage.getItem('onboarding:completed') === 'true';
		} catch {
			return false;
		}
	}

	function markOnboardingCompleted(): void {
		if (!browser) return;
		try {
			localStorage.setItem('onboarding:completed', 'true');
		} catch {
			// ignore
		}
	}

	function openOnboardingFlow(): void {
		onboardingDialogOpen = true;
	}

	function dismissNoChannelsNotice(): void {
		noChannelsNoticeDismissed = true;
		if (workspaceId) persistHomeNoticeDismissed('no-channels', workspaceId);
	}

	function dismissInviteTeamNotice(): void {
		inviteTeamNoticeDismissed = true;
		if (workspaceId) persistHomeNoticeDismissed('invite-team', workspaceId);
	}

	function dismissSoloUpgradeNotice(): void {
		soloUpgradeNoticeDismissed = true;
		if (workspaceId) persistHomeNoticeDismissed('solo-upgrade', workspaceId);
	}

	$effect(() => {
		const orgId = workspaceId;
		noChannelsNoticeDismissed = readHomeNoticeDismissed('no-channels', orgId);
		inviteTeamNoticeDismissed = readHomeNoticeDismissed('invite-team', orgId);
		soloUpgradeNoticeDismissed = readHomeNoticeDismissed('solo-upgrade', orgId);
	});

	/** At most one home notice; no connected channels wins over upgrade and invite. */
	const activeHomeNotice = $derived.by((): 'no-channels' | 'solo-upgrade' | 'invite-team' | null => {
		if (!workspaceId) return null;
		if (
			listStatus === 'ready' &&
			connectedChannelCountVm === 0 &&
			!noChannelsNoticeDismissed
		) {
			return 'no-channels';
		}
		if (
			isSoloPlanVm &&
			myWorkspacesStatus === 'ready' &&
			currentWorkspaceCardVm != null &&
			(myWorkspacesTotalCount <= 1 || currentWorkspaceMemberCountVm <= 1) &&
			!soloUpgradeNoticeDismissed
		) {
			return 'solo-upgrade';
		}
		if (
			myWorkspacesStatus === 'ready' &&
			currentWorkspaceCardVm != null &&
			currentWorkspaceMemberCountVm === 1 &&
			!inviteTeamNoticeDismissed
		) {
			return 'invite-team';
		}
		return null;
	});

	// --- Onboarding visibility (welcome flag + first-empty-workspace auto-open) ---
	$effect(() => {
		const w = protectedHomePagePresenter.showOnboardingWelcome;
		if (w && !prevOnboardingWelcome) {
			onboardingDialogOpen = true;
		}
		prevOnboardingWelcome = w;
		if (!w) {
			onboardingDialogOpen = false;
		}
	});

	$effect(() => {
		if (!onboardingDialogOpen && protectedHomePagePresenter.showOnboardingWelcome) {
			protectedHomePagePresenter.dismissOnboardingWelcome();
		}
	});

	$effect(() => {
		if (hasAutoOpenedOnboarding) return;
		if (!workspaceId) return;
		if (!currentUser) return;
		if (protectedHomePagePresenter.listStatus !== 'ready') return;
		const hasAnyChannels = connectedChannelCountVm > 0;
		if (hasAnyChannels) return;
		if (isOnboardingCompleted()) return;
		onboardingDialogOpen = true;
		hasAutoOpenedOnboarding = true;
	});

	// --- Channel mutations & post-connect query (Pattern B toasts in handlers / effect) ---
	function startAddAnotherChannel(identifier: string): void {
		const orgId = workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			toast.error('Create or select a workspace before connecting a channel.');
			return;
		}
		const connectPath = integrationOAuthCallbackPath(identifier);
		const qs = new URLSearchParams({ organizationId: orgId, returnTo: accountRoot });
		void goto(absoluteUrl(`${connectPath}?${qs}`));
	}

	async function handleRemoveChannel(id: string): Promise<boolean> {
		const resultVm = await protectedHomePagePresenter.removeChannel(id);
		if (resultVm.ok) {
			toast.success('Channel removed.');
			return true;
		}
		toast.error(resultVm.error);
		return false;
	}

	async function handleSetChannelDisabled(id: string, disabled: boolean): Promise<boolean> {
		const resultVm = await protectedHomePagePresenter.setChannelDisabled(id, disabled);
		if (resultVm.ok) {
			toast.success(disabled ? 'Channel disabled.' : 'Channel enabled.');
			return true;
		}
		toast.error(resultVm.error);
		return false;
	}

	$effect(() => {
		const u = page.url;
		const added = u.searchParams.get('added');
		const msg = u.searchParams.get('msg');
		const onboarding = u.searchParams.get('onboarding');
		if (!added && !msg && onboarding !== 'true') return;
		void protectedHomePagePresenter.handlePostConnectQuery(u, goto).then((r) => {
			if (r.handled) {
				if (added) {
					fireProductEvent('channel_added', undefined, currentUser);
				}
				if (r.successToastMessage) {
					toast.success(r.successToastMessage);
				}
			}
		});
	});

	/**
	 * Workspace is loaded by account `+layout` (`afterNavigate` → dock refresh → `workspaceSettingsPresenter.load()`).
	 * Only react to `workspaceId` here — do not call `load()` then branch again, or list/customers fire twice per navigation.
	 */
	$effect(() => {
		const orgId = workspaceId;
		if (!orgId) return;
		void protectedHomePagePresenter.loadHomeLists();
	});

	$effect(() => {
		const workspaceIdsKey = workspacesVm.map((w) => w.id).join(',');
		void workspaceIdsKey;
		void pagePresenter.loadMyWorkspacesOverview(currentUser);
	});

	$effect(() => {
		const activeId = workspaceId;
		const cards = pagePresenter.myWorkspacesCardsVm;
		if (!cards.length || !activeId) return;
		let changed = false;
		const next = cards.map((card) => {
			const isCurrent = card.id === activeId;
			if (card.isCurrent === isCurrent) return card;
			changed = true;
			return { ...card, isCurrent };
		});
		if (changed) pagePresenter.myWorkspacesCardsVm = next;
	});

	function handleSwitchWorkspace(nextWorkspaceId: string) {
		workspaceSettingsPresenter.switchWorkspace(nextWorkspaceId);
	}

	function handleOpenWorkspaceSettings(_targetWorkspaceId: string) {
		void goto(accountSettingsWorkspaceHref);
	}

	function handleOpenDeveloperOAuth(_targetWorkspaceId: string) {
		void goto(accountSettingsDeveloperOAuthHref);
	}

	function handleOpenDeveloperApiKey(_targetWorkspaceId: string) {
		void goto(accountSettingsDeveloperApiKeyHref);
	}

	async function handleCreateWorkspace(name: string) {
		const result = await protectedSettingsPagePresenter.createWorkspace(name);
		if (result.success) {
			void pagePresenter.loadMyWorkspacesOverview(currentUser);
		}
		return result;
	}

	$effect(() => {
		if (listStatus !== 'ready' || !workspaceId) return;
		void pagePresenter.loadMyWorkspacesOverview(currentUser);
	});
</script>

<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
	{#if activeHomeNotice}
		<div class="mb-6">
			{#if activeHomeNotice === 'no-channels'}
				<HomeAccountNoticeBanner
					iconName={icons.Info.name}
					tone="neutral"
					onDismiss={dismissNoChannelsNotice}
				>
					<p class="text-base-content/90">
						This workspace has no connected channels yet. Go through the
						<button
							type="button"
							class="link link-primary font-medium"
							onclick={openOnboardingFlow}
						>
							onboard flow
						</button>
						to get started, or grab an
						<a class="link link-primary font-medium" href={accountSettingsDeveloperApiKeyHref}>
							Auth key
						</a>
						to start automation using agents.
					</p>
					{#snippet actions()}
						<Button
							type="button"
							variant="outline"
							size="sm"
							class="gap-1.5"
							onclick={openOnboardingFlow}
						>
							<AbstractIcon name={icons.Settings.name} class="size-4" width="16" height="16" />
							Go to onboarding
						</Button>
					{/snippet}
				</HomeAccountNoticeBanner>
			{:else if activeHomeNotice === 'solo-upgrade'}
				<HomeAccountNoticeBanner
					iconName={icons.Sparkles.name}
					tone="upgrade"
					onDismiss={dismissSoloUpgradeNotice}
				>
					<p class="text-base-content/90">
						Your Solo plan includes one workspace and one team member. Upgrade to add more workspaces,
						invite collaborators, and unlock unlimited posts per month limit.
					</p>
					{#snippet actions()}
						<Button
							type="button"
							variant="secondary"
							size="sm"
							class="gap-1.5"
							onclick={() => void goto(accountBillingHref)}
						>
							<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
							Upgrade plan
						</Button>
					{/snippet}
				</HomeAccountNoticeBanner>
			{:else if activeHomeNotice === 'invite-team'}
				<HomeAccountNoticeBanner
					iconName={icons.Users.name}
					tone="neutral"
					onDismiss={dismissInviteTeamNotice}
				>
					<p class="text-base-content/90">
						Get more out of your workspace by inviting your team.
					</p>
					{#snippet actions()}
						<Button
							type="button"
							variant="outline"
							size="sm"
							class="gap-1.5"
							onclick={() => void goto(accountSettingsTeamHref)}
						>
							<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
							Invite team members
						</Button>
					{/snippet}
				</HomeAccountNoticeBanner>
			{/if}
		</div>
	{/if}

	<div class="flex items-center gap-3">
		<AbstractIcon
			name={icons.House.name}
			class="text-primary size-8 shrink-0"
			width="32"
			height="32"
		/>
		<h1 class="text-2xl font-bold text-base-content">
			Home
		</h1>
	</div>
	{#if listStatus === 'ready' && connectedChannelCountVm === 0}
		<p class="mt-2 text-base-content/80">
			Welcome{currentUser?.fullName ? `, ${currentUser.fullName}` : ''}! You are at the
			<a class="link link-primary font-medium" href={accountBillingHref}>{currentPlanLabel}</a>
			plan — <a class="link link-primary font-medium" href={accountBillingHref}>view available plans</a>.
		</p>
	{:else if showPostKanbanBoard}
		<p class="mt-2 text-base-content/80">
			Hi! {currentUser?.fullName ? `${currentUser.fullName}, pick` : 'Pick'} up where you left off — move
			posts through Draft, Scheduled, and Published for your connected channels.
		</p>
	{/if}
	<MyWorkspacesSection
		cards={myWorkspacesCardsVm}
		status={myWorkspacesStatus}
		totalCount={myWorkspacesTotalCount}
		allowedWorkspaceCount={allowedWorkspaceCountVm}
		billingHref={accountBillingHref}
		creatingWorkspace={creatingWorkspace}
		onSwitchWorkspace={handleSwitchWorkspace}
		onOpenWorkspaceSettings={handleOpenWorkspaceSettings}
		onOpenDeveloperOAuth={handleOpenDeveloperOAuth}
		onOpenDeveloperApiKey={handleOpenDeveloperApiKey}
		onCreateWorkspace={handleCreateWorkspace}
	/>

	{#if showPostKanbanBoard}
		<PostKanbanBoard
			channels={connectedChannelsVm}
			allGroups={postKanbanAllGroups}
			selectedGroupIds={postKanbanSelectedGroupIds}
			allSocialPlatforms={postKanbanAllSocialPlatforms}
			selectedSocialPlatformIdentifiers={postKanbanSelectedSocialPlatformIdentifiers}
			allTags={postKanbanAllTags}
			selectedTagNames={postKanbanSelectedTagNames}
			tagsVm={workspaceTagsVm}
			kanbanPosts={postKanbanPostsForTagFilter}
			columnsVm={postKanbanColumnsVm}
			columnCountsVm={postKanbanColumnCountsVm}
			columnOptions={postKanbanColumnOptions}
			sourceFilterOptions={postKanbanSourceFilterOptions}
			timeFilterOptions={postKanbanTimeFilterOptions}
			sourceFilter={postKanbanSourceFilter}
			timeFilter={postKanbanTimeFilter}
			status={postKanbanStatus}
			error={postKanbanError}
			movingPostGroup={postKanbanMovingPostGroup}
			postsUsedThisMonth={postsUsedThisMonthVm}
			allowedPostsPerMonth={allowedPostsPerMonthVm}
			billingHref={accountBillingHref}
			calendarHref={calendarPath}
			onGroupFilterChange={(next) => postKanbanBoard.setGroupFilter(next)}
			onSocialPlatformFilterChange={(next) => postKanbanBoard.setSocialPlatformFilter(next)}
			onTagFilterChange={(next) => postKanbanBoard.setTagFilter(next)}
			onSourceFilterChange={(next) => postKanbanBoard.setSourceFilter(next)}
			onTimeFilterChange={(next) => postKanbanBoard.setTimeFilter(next)}
			onMoveCardToColumn={handleKanbanMoveCardToColumn}
			onToggleReviewed={(id, checked) => void postKanbanBoard.toggleReviewed(id, checked)}
			onNoteChange={(id, note) => void postKanbanBoard.updateNote(id, note)}
			onOpenPostActions={openKanbanPostActions}
			onEditPost={openEditKanbanPostGroup}
		/>
	{/if}

	<MyChannelsSection
		workspaceId={workspaceId}
		listStatus={listStatus}
		connectedChannelsVm={connectedChannelsVm}
		accountSettingsWorkspaceHref={accountSettingsWorkspaceHref}
		allowedChannelCount={allowedChannelCountVm}
		billingHref={accountBillingHref}
		{channelGroupSectionsVm}
		{platformChannelRowsUngroupedVm}
		channelsGridPresenter={channelsGridPresenter}
		channelsFilterPresenter={channelsFilterPresenter}
		continueSetupHref={(i) => pagePresenter.continueSetupHref(i)}
		onCreatePost={openCreatePost}
		onCreatePostForGroup={openCreatePostForGroup}
		onGoToCalendar={goToCalendar}
		onMoveToGroup={openMoveGroupModal}
		onEditTimeSlots={openTimeTableModal}
		onSetDisabled={handleSetChannelDisabled}
		onRemove={handleRemoveChannel}
		onAddAnotherChannel={startAddAnotherChannel}
		onOpenChannelActions={(integration) => {
			channelActionsFor = integration;
			channelActionsOpen = true;
		}}
	/>
</div>

<SetPickerDialog
	bind:open={setPickOpen}
	setsVm={setPickRowsVm}
	onPick={handleSetPickRow}
	onContinueWithout={() => finishSetPick(null)}
	onDismiss={() => finishSetPick(undefined)}
/>

<MoveChannelGroupModal bind:open={moveGroupOpen} integration={moveGroupFor} />

<TimeTable
	bind:open={timeTableOpen}
	integration={timeTableForVm}
/>

<ShowPostActionsModal
	open={kanbanActionsOpen}
	postGroup={kanbanActionsPostGroup}
	focusPostId={kanbanActionsFocusPostId}
	busy={kanbanActionsBusy}
	channels={connectedChannelsVm}
	channelLookupPosts={postKanbanBoard.postsForChannelLookup}
	loadPostGroup={(pg) => postKanbanBoard.getPostGroup(pg)}
	onClose={closeKanbanPostActions}
	onEdit={openEditKanbanPostGroup}
	onDuplicate={duplicateKanbanPostGroup}
	onCopy={copyKanbanPostGroupText}
	onDelete={requestDeleteKanbanPostGroup}
	onPreview={() => void previewKanbanPostGroup()}
/>

<DeleteModal
	bind:open={kanbanDeleteConfirmOpen}
	title="Are you sure?"
	description="Are you sure you want to delete this post?"
	confirmLabel="Yes, delete it!"
	cancelLabel="No, cancel!"
	onConfirm={() => void confirmDeleteKanbanPostGroup()}
	onCancel={() => (kanbanDeleteConfirmOpen = false)}
/>

<CreateSocialPostModal
	bind:open={createSocialPostOpen}
	bind:presenter={createSocialPostModalPresenter}
	workspaceId={workspaceId}
	connectedChannels={connectedChannelsVm}
	uploadUid={workspaceId ?? ''}
	onScheduled={handleComposerScheduled}
	onDraftSaved={handleComposerDraftSaved}
/>

<OnBoardingModal
	open={onboardingDialogOpen}
	onOpenChange={(v) => {
		onboardingDialogOpen = v;
		if (!v) {
			markOnboardingCompleted();
			if (protectedHomePagePresenter.showOnboardingWelcome) {
				protectedHomePagePresenter.dismissOnboardingWelcome();
			}
		}
	}}
/>

<ShowChannelActionsModal
	open={channelActionsOpen}
	integration={channelActionsFor}
	workspaceId={workspaceId}
	continueSetupHref={(i) => protectedHomePagePresenter.continueSetupHref(i)}
	onClose={() => (channelActionsOpen = false)}
	onCreatePost={(i) => openCreatePost(i.id)}
	onMoveToGroup={openMoveGroupModal}
	onEditTimeSlots={openTimeTableModal}
	onSetDisabled={handleSetChannelDisabled}
	onRemove={handleRemoveChannel}
/>

