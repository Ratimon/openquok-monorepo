<script lang="ts">
	import type { PageData } from './$types';
	import type { IApi } from '@svar-ui/svelte-grid';
	import type {
		CreateSocialPostChannelViewModel,
		HomeChannelsLayoutModeViewModel
	} from '$lib/channels';
	import type { ChannelsGridActions } from '$lib/ui/components/channels/channelsGridContext';
	import type { SetRowViewModel, SetSnapshotViewModel } from '$lib/sets';

	// --- App / routing ---
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { setContext } from 'svelte';
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
	import { createHomeChannelsGridTableFilter } from '$lib/channels/HomeChannelsGridFilterBuilder.presenter.svelte';
	import { getSetPresenter } from '$lib/sets';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { buildAccountSettingsSearchParams } from '$lib/settings/utils/buildAccountSettingsSearch';

	// --- Feedback ---
	import { fireProductEvent } from '$lib/product-analytics';
	import { toast } from '$lib/ui/sonner';

	// --- Data / icons ---
	import { icons } from '$data/icons';
	// --- UI ---
	import { Alert, AlertDescription, AlertTitle } from '$lib/ui/alert';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AddProvider from '$lib/ui/components/posts/AddProvider.svelte';
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
	import { channelsGridActionsKey } from '$lib/ui/components/channels/channelsGridContext';
	import ChannelsChipsLayout from '$lib/ui/components/channels/ChannelsChipsLayout.svelte';
	import ChannelsGridLayout from '$lib/ui/components/channels/ChannelsGridLayout.svelte';
	import MyWorkspaces from '$lib/ui/components/workspaces/MyWorkspaces.svelte';

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
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	$effect(() => {
		void postKanbanBoard.load(workspaceId);
	});

	const platformChannelRowsUngrouped = $derived(protectedHomePagePresenter.platformChannelRowsUngrouped);
	const channelGroupSections = $derived(protectedHomePagePresenter.channelGroupSections);
	const listStatus = $derived(protectedHomePagePresenter.listStatus);
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
	const homeChannelTableRowsVm = $derived(channelsGridPresenter.homeChannelTableRowsVm);

	const DASHBOARD_CHANNELS_GRID_PAGE_SIZE = 25;

	let channelsGridPage = $state(1);
	let channelsGridPageSize = $state(DASHBOARD_CHANNELS_GRID_PAGE_SIZE);

	const channelsGridFilteredRowsVm = $derived.by(() => {
		const filter = createHomeChannelsGridTableFilter(channelsFilterPresenter.value);
		return homeChannelTableRowsVm.filter(filter);
	});

	const channelsGridPagedRowsVm = $derived.by(() => {
		const from = (channelsGridPage - 1) * channelsGridPageSize;
		const to = Math.min(from + channelsGridPageSize, channelsGridFilteredRowsVm.length);
		return channelsGridFilteredRowsVm.slice(from, to);
	});

	let channelsLayoutMode = $state<HomeChannelsLayoutModeViewModel>('chips');

	let channelsGridApi = $state<IApi | undefined>(undefined);
	let channelsGridHostEl = $state<HTMLDivElement | null>(null);
	let channelsGridHostWidthPx = $state(0);
	let windowWidthPx = $state(0);

	let channelActionsOpen = $state(false);
	let channelActionsFor = $state<CreateSocialPostChannelViewModel | null>(null);

	function readViewportWidthPx(): number {
		if (!browser || typeof window === 'undefined') return 0;
		const inner = window.innerWidth;
		const vv = window.visualViewport?.width;
		return Math.floor(Math.min(inner, vv != null && vv > 0 ? vv : inner));
	}

	const layoutTierWidthPx = $derived.by(() => {
		if (!browser) return 0;
		return windowWidthPx > 0 ? windowWidthPx : readViewportWidthPx();
	});

	const channelsGridLayoutWidthPx = $derived.by(() => {
		if (!browser) return 0;
		const vw = layoutTierWidthPx;
		if (vw <= 0) return 0;
		if (vw <= 640) return vw;
		const host = channelsGridHostWidthPx;
		if (host > 0) return Math.min(vw, Math.floor(host));
		return vw;
	});

	const channelsGridColumnsForHost = $derived.by(() =>
		channelsGridPresenter.getHomeChannelsGridColumnsForViewport(
			layoutTierWidthPx,
			channelsGridLayoutWidthPx,
			browser
		)
	);

	const channelsGridSizesForHost = $derived.by(() =>
		channelsGridPresenter.getHomeChannelsGridSizesForViewport(layoutTierWidthPx, browser)
	);

	const channelsGridAutoRowHeight = $derived(
		channelsGridPresenter.getHomeChannelsGridAutoRowHeight(layoutTierWidthPx, browser)
	);

	/** Same integration `identifier` with two or more social connections (different accounts). */
	const hasSocialPlatformWithMultipleChannels = $derived.by(() => {
		const social = connectedChannelsVm.filter((c) => (c.type ?? '').toLowerCase() === 'social');
		const counts = new Map<string, number>();
		for (const c of social) {
			const key = c.identifier?.trim() || 'unknown';
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
		for (const n of counts.values()) {
			if (n >= 2) return true;
		}
		return false;
	});

	const showSamePlatformMultiChannelAlert = $derived(
		Boolean(workspaceId) &&
			listStatus === 'ready' &&
			connectedChannelCountVm === 1 &&
			!hasSocialPlatformWithMultipleChannels
	);

	// --- Modal open state ---
	let groupDetailsOpen = $state<Record<string, boolean>>({});
	let ungroupedDetailsOpen = $state(true);
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
	}

	async function openCreatePostForGroup(groupId: string) {
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

	// --- Effects: section defaults + modal cleanup ---
	$effect.pre(() => {
		for (const g of channelGroupSections) {
			if (groupDetailsOpen[g.id] === undefined) {
				groupDetailsOpen[g.id] = true;
			}
		}
	});

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

	$effect.pre(() => {
		if (!browser) return;
		windowWidthPx = readViewportWidthPx();
	});

	$effect(() => {
		if (!browser) return;
		const update = () => {
			windowWidthPx = readViewportWidthPx();
		};
		window.addEventListener('resize', update);
		window.visualViewport?.addEventListener('resize', update);
		return () => {
			window.removeEventListener('resize', update);
			window.visualViewport?.removeEventListener('resize', update);
		};
	});

	$effect(() => {
		if (!browser) return;
		const el = channelsGridHostEl;
		if (!el) {
			channelsGridHostWidthPx = 0;
			return;
		}
		let raf = 0;
		const commit = () => {
			raf = 0;
			const next = Math.round(el.getBoundingClientRect().width);
			if (channelsGridHostWidthPx === 0 || Math.abs(next - channelsGridHostWidthPx) >= 6) {
				channelsGridHostWidthPx = next;
			}
		};
		const schedule = () => {
			if (raf) cancelAnimationFrame(raf);
			raf = requestAnimationFrame(commit);
		};
		schedule();
		const ro = new ResizeObserver(schedule);
		ro.observe(el);
		return () => {
			ro.disconnect();
			if (raf) cancelAnimationFrame(raf);
		};
	});

	$effect(() => {
		void workspaceId;
		channelsFilterPresenter.reset();
	});

	$effect(() => {
		void homeChannelTableRowsVm;
		void channelsFilterPresenter.value;
		void channelsGridPageSize;
		channelsGridPage = 1;
	});

	$effect(() => {
		const total = channelsGridFilteredRowsVm.length;
		const pageCount = Math.max(1, Math.ceil(total / channelsGridPageSize) || 1);
		if (channelsGridPage > pageCount) {
			channelsGridPage = pageCount;
		}
	});

	/**
	 * Onboarding wizard (`OnBoardingModal`): wide modal, step 1 uses a 9-column grid on large screens.
	 * It opens from the `$effect` below when there are no connected channels and onboarding is not
	 * marked complete in `localStorage` (key `onboarding:completed`).
	 *
	 * To preview the onboarding UI:
	 * - DevTools → Application → Local Storage → delete key `onboarding:completed`
	 * - Remove all channels for the workspace (or use an empty workspace), then reload `/account`
	 * - Or temporarily force: change the initial state on the next line from `false` to `true`
	 *   (`let onboardingDialogOpen = $state(true)`), then revert after testing.
	 */
	let onboardingDialogOpen = $state(false);
	let prevOnboardingWelcome = $state(false);
	let hasAutoOpenedOnboarding = $state(false);

	function isOnboardingCompleted(): boolean {
		if (typeof window === 'undefined') return false;
		try {
			return localStorage.getItem('onboarding:completed') === 'true';
		} catch {
			return false;
		}
	}

	function markOnboardingCompleted(): void {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem('onboarding:completed', 'true');
		} catch {
			// ignore
		}
	}

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

	setContext(channelsGridActionsKey, {
		openActions: (integration: CreateSocialPostChannelViewModel) => {
			channelActionsFor = integration;
			channelActionsOpen = true;
		},
		addMoreChannel: startAddAnotherChannel
	} satisfies ChannelsGridActions);

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
			Welcome{currentUser?.fullName ? `, ${currentUser.fullName}` : ''}! Connect channels for the
			selected workspace to start scheduling posts and manage them here.
		</p>
	{:else if showPostKanbanBoard}
		<p class="mt-2 text-base-content/80">
			Hi! {currentUser?.fullName ? `${currentUser.fullName}, pick` : 'Pick'} up where you left off — move
			posts through Draft, Scheduled, and Published for your connected channels.
		</p>
	{/if}
	<MyWorkspaces
		cards={myWorkspacesCardsVm}
		status={myWorkspacesStatus}
		totalCount={myWorkspacesTotalCount}
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
			calendarHref={calendarPath}
			onGroupFilterChange={(next) => postKanbanBoard.setGroupFilter(next)}
			onSocialPlatformFilterChange={(next) => postKanbanBoard.setSocialPlatformFilter(next)}
			onTagFilterChange={(next) => postKanbanBoard.setTagFilter(next)}
			onSourceFilterChange={(next) => postKanbanBoard.setSourceFilter(next)}
			onTimeFilterChange={(next) => postKanbanBoard.setTimeFilter(next)}
			onMoveCardToColumn={(payload, column) => postKanbanBoard.moveCardToColumn(payload, column)}
			onToggleReviewed={(id, checked) => void postKanbanBoard.toggleReviewed(id, checked)}
			onNoteChange={(id, note) => void postKanbanBoard.updateNote(id, note)}
			onOpenPostActions={openKanbanPostActions}
			onEditPost={openEditKanbanPostGroup}
		/>
	{/if}

	<section class="mt-8">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex min-w-0 flex-wrap items-center gap-3">
				<h3 class="text-lg font-semibold text-base-content">
					Connected channels
				</h3>
				{#if listStatus === 'ready' && connectedChannelCountVm > 0}
					<div
						class="inline-flex overflow-hidden rounded-lg border border-base-300 bg-base-100"
						role="group"
						aria-label="Chips or table layout"
					>
						<Button
							type="button"
							variant={channelsLayoutMode === 'chips' ? 'secondary' : 'ghost'}
							size="sm"
							class="rounded-none px-2.5"
							aria-label="Grouped chips view"
							aria-pressed={channelsLayoutMode === 'chips'}
							onclick={() => (channelsLayoutMode = 'chips')}
						>
							<AbstractIcon name={icons.List.name} class="size-4" width="16" height="16" />
						</Button>
						<Button
							type="button"
							variant={channelsLayoutMode === 'table' ? 'secondary' : 'ghost'}
							size="sm"
							class="rounded-none px-2.5"
							aria-label="Table view"
							aria-pressed={channelsLayoutMode === 'table'}
							onclick={() => (channelsLayoutMode = 'table')}
						>
							<AbstractIcon name={icons.Table.name} class="size-4" width="16" height="16" />
						</Button>
					</div>
				{/if}
			</div>

			<div class="flex flex-wrap items-center justify-end gap-2">
				{#if connectedChannelCountVm >= 1}
					<Button
						type="button"
						variant="primary"
						class="gap-1.5"
						disabled={!workspaceId}
						onclick={() => {
							if (!workspaceId) {
								toast.error('Create or select a workspace first.');
								return;
							}
							openCreatePost(null);
						}}
					>
						<AbstractIcon name={icons.Plus.name} class="h-4 w-4" width="16" height="16" />
						Create Post for All Channels
					</Button>
					<Button
						type="button"
						variant="outline"
						class="gap-1.5"
						disabled={!workspaceId}
						onclick={() => goToCalendar(null)}
					>
						<AbstractIcon
							name={icons.CalendarClock.name}
							class="h-4 w-4"
							width="16"
							height="16"
						/>
						Calendar
					</Button>
				{/if}
				<AddProvider
					buttonLabel="Add Channel"
					hasConnectedChannels={connectedChannelCountVm >= 1}
				/>
				<AddProvider
					invite
					iconOnly
					iconOnlyTooltip="Send Invite Link to connect channel"
					hasConnectedChannels={connectedChannelCountVm >= 1}
				/>
			</div>
		</div>

		{#if showSamePlatformMultiChannelAlert}
			<Alert
				variant="warning"
				class="mt-3 items-start gap-3 text-sm text-neutral-950 sm:flex-row [&_svg]:text-neutral-950"
			>
				<AbstractIcon
					name={icons.CircleAlert.name}
					class="mt-0.5 h-5 w-5 shrink-0 text-neutral-950"
					width="20"
					height="20"
					focusable="false"
				/>
				<div class="min-w-0 space-y-1">
					<AlertTitle class="text-sm font-semibold leading-snug text-neutral-950">
						Multiple channels on the same platform
					</AlertTitle>
					<AlertDescription class="leading-relaxed text-neutral-900">
						You can connect more than one channel per platform. Before you use
						<span class="font-semibold text-neutral-950">Add Channel</span> or
						<span class="font-semibold text-neutral-950">Add more</span> for a different login,
						sign out of that service in your browser. Otherwise the channel may be reused for the last connected channel.
					</AlertDescription>
				</div>
			</Alert>
		{/if}

		{#if !workspaceId}
			<p class="mt-3 text-sm text-base-content/70">
				Select or create a workspace in
				<a class="link link-primary" href={accountSettingsWorkspaceHref}>settings</a>
				to load channels.
			</p>
		{:else if listStatus === 'loading'}
			<p class="mt-4 flex items-center gap-2 text-sm text-base-content/70">
				<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
				Loading channels…
			</p>
		{:else if listStatus === 'error'}
			<p class="mt-3 text-sm text-error">
				Could not load channels. Try again in a moment.</p>
		{:else if connectedChannelCountVm === 0}
			<div class="mt-4 space-y-3">
				<h4 class="text-base font-semibold text-base-content">
					No channels yet
				</h4>
				<p class="text-sm text-base-content/70">
					Connect your social accounts to start scheduling, publishing, and analyzing — all in one place.
				</p>
				<p class="text-sm text-base-content/70">
					Use <span class="font-medium text-base-content">Add Channel</span> above to connect one.
				</p>
			</div>
		{:else if channelsLayoutMode === 'table'}
			<ChannelsGridLayout
				filteredRowCount={channelsGridFilteredRowsVm.length}
				pagedRowsVm={channelsGridPagedRowsVm}
				filterValue={channelsFilterPresenter.value}
				filterFields={channelsFilterPresenter.fields}
				filterHasAnyRule={channelsFilterPresenter.hasAnyRule}
				filterIsReady={channelsFilterPresenter.isReady}
				filterAddMenuOpen={channelsFilterPresenter.addFilterMenuOpen}
				filterAddableFieldOptions={channelsFilterPresenter.addableFieldOptions}
				filterOptions={channelsFilterPresenter.buildOptions(homeChannelTableRowsVm)}
				gridColumns={channelsGridColumnsForHost}
				gridSizes={channelsGridSizesForHost}
				gridAutoRowHeight={channelsGridAutoRowHeight}
				gridCellStyle={channelsGridPresenter.homeChannelsGridCellStyle}
				bind:gridHostEl={channelsGridHostEl}
				bind:gridPage={channelsGridPage}
				bind:gridPageSize={channelsGridPageSize}
				onFilterInit={(api) => channelsFilterPresenter.initFilterBuilderApi(api)}
				onFilterChange={(ev) => channelsFilterPresenter.applyChange(ev)}
				onFilterToggleAddMenu={() => channelsFilterPresenter.toggleAddFilterMenu()}
				onFilterAddField={(fieldId) => channelsFilterPresenter.addFilterForField(fieldId)}
				onGridInit={(api) => {
					channelsGridApi = api;
				}}
			/>
		{:else if workspaceId}
			<ChannelsChipsLayout
				{channelGroupSections}
				{platformChannelRowsUngrouped}
				bind:groupDetailsOpen
				bind:ungroupedDetailsOpen
				workspaceId={workspaceId}
				continueSetupHref={(i) => pagePresenter.continueSetupHref(i)}
				onCreatePostForGroup={openCreatePostForGroup}
				onCreatePost={openCreatePost}
				onGoToCalendar={goToCalendar}
				onCreatePostForChannel={(id) => openCreatePost(id)}
				onMoveToGroup={openMoveGroupModal}
				onEditTimeSlots={openTimeTableModal}
				onSetDisabled={handleSetChannelDisabled}
				onRemove={handleRemoveChannel}
				onAddAnotherChannel={startAddAnotherChannel}
			/>
		{/if}
	</section>
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
	onScheduled={() => {
		void postKanbanBoard.refresh();
		goToCalendar(null);
	}}
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

