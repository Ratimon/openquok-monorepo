<script lang="ts">
	import type { PageData } from './$types';
	import type { IApi } from '@svar-ui/svelte-grid';
	import type {
		CreateSocialPostChannelViewModel,
		DashboardChannelsLayoutModeViewModel,
		DashboardPlatformChannelRowViewModel
	} from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import { createDashboardChannelsGridTableFilter } from '$lib/area-protected/DashboardChannelsGridFilterBuilder.presenter.svelte';
	import type { SetRowViewModel, SetSnapshotViewModel } from '$lib/sets';

	// --- App / routing ---
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { setContext } from 'svelte';
	import { absoluteUrl, route, url } from '$lib/utils/path';

	// --- Area & integrations ---
	import { getRootPathAccount, protectedDashboardPagePresenter } from '$lib/area-protected';
	import { getSetPresenter } from '$lib/sets';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import { CALENDAR_UNGROUPED_SENTINEL } from '$lib/posts';
	import { workspaceSettingsPresenter } from '$lib/settings';

	// --- Feedback ---
	import { toast } from '$lib/ui/sonner';

	// --- Data / icons ---
	import { icons } from '$data/icons';
	import { socialProviderDisplayLabel, socialProviderIcon } from '$data/social-providers';

	// --- UI ---
	import { Alert, AlertDescription, AlertTitle } from '$lib/ui/alert';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AddProvider from '$lib/ui/components/posts/AddProvider.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';
	import SetPickerDialog from '$lib/ui/components/posts/SetPickerDialog.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';
	import MoveChannelGroupModal from '$lib/ui/components/posts/MoveChannelGroupModal.svelte';
	import OnBoardingModal from '$lib/ui/components/posts/OnBoardingModal.svelte';
	import TimeTable from '$lib/ui/components/posts/TimeTable.svelte';
	import ShowChannelActionsModal from '$lib/ui/components/posts/ShowChannelActionsModal.svelte';
	import {
		dashboardChannelsGridActionsKey,
		type DashboardChannelsGridActions
	} from '$lib/ui/components/dashboard-channels/dashboardChannelsGridContext';
	import { FilterBuilder, Willow as FilterWillow } from '@svar-ui/svelte-filter';
	import { Willow, Grid, Tooltip } from '@svar-ui/svelte-grid';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	const pagePresenter = protectedDashboardPagePresenter;
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

	// --- Workspace + dashboard VMs ---
	const accountRoot = $derived(accountPath);
	const accountSettingsWorkspaceHref = $derived(url(`${accountRoot}/settings?section=workspace`));
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const platformChannelRowsUngrouped = $derived(protectedDashboardPagePresenter.platformChannelRowsUngrouped);
	const channelGroupSections = $derived(protectedDashboardPagePresenter.channelGroupSections);
	const listStatus = $derived(protectedDashboardPagePresenter.listStatus);
	const connectedChannelsVm = $derived(protectedDashboardPagePresenter.connectedChannelsVm);
	const connectedChannelCountVm = $derived(connectedChannelsVm.length);
	const dashboardChannelTableRowsVm = $derived(channelsGridPresenter.dashboardChannelTableRowsVm);

	let channelsLayoutMode = $state<DashboardChannelsLayoutModeViewModel>('chips');

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
		channelsGridPresenter.getDashboardChannelsGridColumnsForViewport(
			layoutTierWidthPx,
			channelsGridLayoutWidthPx,
			browser
		)
	);

	const channelsGridSizesForHost = $derived.by(() =>
		channelsGridPresenter.getDashboardChannelsGridSizesForViewport(layoutTierWidthPx, browser)
	);

	const channelsGridAutoRowHeight = $derived(
		channelsGridPresenter.getDashboardChannelsGridAutoRowHeight(layoutTierWidthPx, browser)
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
		void dashboardChannelTableRowsVm;
		void channelsFilterPresenter.value;
		const api = channelsGridApi;
		if (!api) return;
		api.exec('filter-rows', {
			filter: createDashboardChannelsGridTableFilter(channelsFilterPresenter.value)
		});
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
		const w = protectedDashboardPagePresenter.showOnboardingWelcome;
		if (w && !prevOnboardingWelcome) {
			onboardingDialogOpen = true;
		}
		prevOnboardingWelcome = w;
		if (!w) {
			onboardingDialogOpen = false;
		}
	});

	$effect(() => {
		if (!onboardingDialogOpen && protectedDashboardPagePresenter.showOnboardingWelcome) {
			protectedDashboardPagePresenter.dismissOnboardingWelcome();
		}
	});

	$effect(() => {
		if (hasAutoOpenedOnboarding) return;
		if (!workspaceId) return;
		if (!currentUser) return;
		if (protectedDashboardPagePresenter.listStatus !== 'ready') return;
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

	setContext(dashboardChannelsGridActionsKey, {
		openActions: (integration: CreateSocialPostChannelViewModel) => {
			channelActionsFor = integration;
			channelActionsOpen = true;
		},
		addMoreChannel: startAddAnotherChannel
	} satisfies DashboardChannelsGridActions);

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

	$effect(() => {
		const u = page.url;
		const added = u.searchParams.get('added');
		const msg = u.searchParams.get('msg');
		const onboarding = u.searchParams.get('onboarding');
		if (!added && !msg && onboarding !== 'true') return;
		void protectedDashboardPagePresenter.handlePostConnectQuery(u, goto).then((r) => {
			if (r.handled && r.successToastMessage) {
				toast.success(r.successToastMessage);
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
		void protectedDashboardPagePresenter.loadDashboardLists();
	});
</script>

<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
	{#snippet platformChannelRows(rows: DashboardPlatformChannelRowViewModel[])}
		<div class="divide-y divide-base-300">
			{#each rows as row (row.identifier)}
				<div class="flex w-full flex-wrap items-center gap-3 py-4 first:pt-1">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200/70 text-base-content"
						aria-hidden="true"
					>
						<AbstractIcon
							name={socialProviderIcon(row.identifier)}
							class="size-6"
							width="24"
							height="24"
						/>
					</div>
					<ul class="flex min-w-0 flex-1 list-none flex-wrap gap-2 p-0">
						{#each row.items as integration (integration.id)}
							<li class="min-w-0">
								<IntegrationMenu
									variant="chip"
									{integration}
									workspaceId={workspaceId!}
									providerIcon={socialProviderIcon}
									continueSetupHref={(i) => protectedDashboardPagePresenter.continueSetupHref(i)}
									onCreatePost={() => openCreatePost(integration.id)}

									onMoveToGroup={openMoveGroupModal}
									onEditTimeSlots={openTimeTableModal}
									onSetDisabled={handleSetChannelDisabled}
									onRemove={handleRemoveChannel}
								/>
							</li>
						{/each}
					</ul>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="shrink-0 gap-1.5 border-base-300"
						aria-label={`Add another ${socialProviderDisplayLabel(row.identifier)} connection`}
						onclick={() => startAddAnotherChannel(row.identifier)}
					>
						<span class="inline-flex items-center gap-1.5" aria-hidden="true">
							<AbstractIcon name={icons.Plus.name} class="h-4 w-4" width="16" height="16" />
							Add more
							<AbstractIcon
								name={socialProviderIcon(row.identifier)}
								class="h-4 w-4"
								width="16"
								height="16"
							/>
						</span>
					</Button>
				</div>
			{/each}
		</div>
	{/snippet}

	<div class="flex items-center gap-3">
		<AbstractIcon
			name={icons.Gauge.name}
			class="text-primary size-8 shrink-0"
			width="32"
			height="32"
		/>
		<h1 class="text-2xl font-bold text-base-content">
			Account dashboard
		</h1>
	</div>
	<p class="mt-2 text-base-content/80">
		Welcome to your account. Connect channels for the selected workspace and manage them here.
	</p>
	{#if currentUser}
		<dl class="mt-6 grid gap-2 text-sm sm:grid-cols-2">
			<div class="contents">
				<dt class="font-medium text-base-content/70">
					Email</dt>
				<dd class="text-base-content">
					{currentUser.email}</dd>
			</div>
			<div class="contents">
				<dt class="font-medium text-base-content/70">
					Full name</dt>
				<dd class="text-base-content">
					{currentUser.fullName ?? '—'}</dd>
			</div>
			<div class="contents">
				<dt class="font-medium text-base-content/70">
					Username</dt>
				<dd class="text-base-content">
					{currentUser.username ?? '—'}</dd>
			</div>
		</dl>
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
			<p class="mt-4 text-sm text-base-content/70">
				To add a channel to a group, open its menu and select
				<span class="font-medium text-base-content">Move / add to group</span>.
			</p>
			<div class="mt-3 rounded-xl border border-base-300 bg-base-100 shadow-sm">
				<div class="border-b border-base-300 px-3 py-3">
					{#if channelsFilterPresenter.hasAnyRule}
						<p class="mb-2 text-xs font-medium tracking-wide text-base-content/70 uppercase">
							Filters
						</p>
					{/if}
					<div class="flex min-w-0 items-end justify-end gap-2">
						<div
							class="channels-filter-builder min-h-0 min-w-0 flex-1 justify-end overflow-y-visible"
							class:channels-filter-builder--empty={!channelsFilterPresenter.hasAnyRule}
							class:overflow-x-auto={channelsFilterPresenter.hasAnyRule}
						>
							<FilterWillow fonts={false}>
								<FilterBuilder
									value={channelsFilterPresenter.value}
									fields={channelsFilterPresenter.fields}
									options={channelsFilterPresenter.buildOptions(dashboardChannelTableRowsVm)}
									type="line"
									init={(api: unknown) => channelsFilterPresenter.initFilterBuilderApi(api)}
									onchange={(ev: { value: { glue: 'and' | 'or'; rules: unknown[] } }) =>
										channelsFilterPresenter.applyChange(ev)}
								/>
							</FilterWillow>
						</div>
						<div class="relative shrink-0">
							<Button
								type="button"
								variant="secondary"
								class="h-9 gap-2 whitespace-nowrap"
								onclick={() => channelsFilterPresenter.toggleAddFilterMenu()}
								disabled={!channelsFilterPresenter.addableFieldOptions.length || !channelsFilterPresenter.isReady}
							>
								<AbstractIcon name={icons.ListFilterPlus.name} class="size-4 shrink-0" width="16" height="16" />
								Add filters
								<AbstractIcon name={icons.ChevronDown.name} class="size-4 shrink-0 opacity-80" width="16" height="16" />
							</Button>
							{#if channelsFilterPresenter.addFilterMenuOpen}
								<div
									class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-lg"
								>
									{#each channelsFilterPresenter.addableFieldOptions as opt (opt.id)}
										<button
											type="button"
											class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-base-content hover:bg-base-200"
											onclick={() => channelsFilterPresenter.addFilterForField(opt.id)}
										>
											<span class="truncate">{opt.label}</span>
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div
					class="svar-grid-host--fit-content min-h-[200px] min-w-0 w-full overflow-x-auto {dashboardChannelTableRowsVm.length <= 80
						? 'svar-grid-host--body-auto-height'
						: ''}"
					bind:this={channelsGridHostEl}
				>
					<Willow fonts={false}>
						<Tooltip api={channelsGridApi}>
							<Grid
								data={dashboardChannelTableRowsVm}
								columns={channelsGridColumnsForHost}
								sizes={channelsGridSizesForHost}
								autoRowHeight={channelsGridAutoRowHeight}
								cellStyle={channelsGridPresenter.dashboardChannelsGridCellStyle}
								select={false}
								header={true}
								init={(api: IApi) => {
									channelsGridApi = api;
								}}
							/>
						</Tooltip>
					</Willow>
				</div>
			</div>
		{:else}
			{#if channelGroupSections.length > 0}
				<div class="mt-4 space-y-2">
					<h4 class="text-sm font-semibold text-base-content/80">
						Grouped accounts/channels
					</h4>
					{#each channelGroupSections as group (group.id)}
						<details class="rounded-lg border border-base-300 bg-base-200/40" bind:open={groupDetailsOpen[group.id]}>
							<summary
								class="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 marker:hidden [&::-webkit-details-marker]:hidden"
							>
								<AbstractIcon
									name={icons.ChevronRight.name}
									class="size-4 shrink-0 text-base-content/70 transition-transform duration-200 {groupDetailsOpen[group.id]
										? 'rotate-90'
										: ''}"
									width="16"
									height="16"
								/>
								<span class="min-w-0 flex-1 truncate font-medium text-base-content">{group.name}</span>
								<Button
									type="button"
									size="sm"
									variant="secondary"
									class="shrink-0"
									onclick={(e: MouseEvent) => {
										e.preventDefault();
										e.stopPropagation();
										openCreatePostForGroup(group.id);
									}}
								>
									Create Post for {group.name}
								</Button>
								<Button
									type="button"
									size="sm"
									variant="outline"
									class="shrink-0 gap-1.5"
									onclick={(e: MouseEvent) => {
										e.preventDefault();
										e.stopPropagation();
										goToCalendar(group.id);
									}}
								>
									<AbstractIcon
										name={icons.CalendarClock.name}
										class="h-4 w-4"
										width="16"
										height="16"
									/>
									Calendar
								</Button>
							</summary>
							<div class="border-t border-base-300 px-3 py-3">
								{@render platformChannelRows(group.platformRows)}
							</div>
						</details>
					{/each}
				</div>
			{/if}
			{#if platformChannelRowsUngrouped.length > 0}
				<div class="mt-4 space-y-2">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<h4 class="text-sm font-semibold text-base-content/80">
							Ungrouped accounts/channels
						</h4>
						<div class="flex flex-wrap items-center justify-end gap-2">
							<Button
								type="button"
								size="sm"
								variant="primary"
								class="shrink-0 gap-1.5"
								onclick={(e: MouseEvent) => {
									e.preventDefault();
									e.stopPropagation();
									openCreatePost(null);
								}}
							>
								<AbstractIcon name={icons.Plus.name} class="h-4 w-4" width="16" height="16" />
								Create Post
							</Button>
							<Button
								type="button"
								size="sm"
								variant="outline"
								class="shrink-0 gap-1.5"
								onclick={(e: MouseEvent) => {
									e.preventDefault();
									e.stopPropagation();
									goToCalendar(CALENDAR_UNGROUPED_SENTINEL);
								}}
							>
								<AbstractIcon
									name={icons.CalendarClock.name}
									class="h-4 w-4"
									width="16"
									height="16"
								/>
								Calendar
							</Button>
						</div>
					</div>
					<p class="text-sm text-base-content/70">
						To add a channel to a group, open its menu and select <span class="font-medium text-base-content">Move / add to group</span>.
					</p>
					{#if channelGroupSections.length === 0}
						<details class="rounded-lg border border-base-300 bg-base-200/40" bind:open={ungroupedDetailsOpen}>
							<summary
								class="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 marker:hidden [&::-webkit-details-marker]:hidden"
							>
								<AbstractIcon
									name={icons.ChevronRight.name}
									class="size-4 shrink-0 text-base-content/70 transition-transform duration-200 {ungroupedDetailsOpen
										? 'rotate-90'
										: ''}"
									width="16"
									height="16"
								/>
								<span class="font-medium text-base-content">Channels</span>
							</summary>
							<div class="border-t border-base-300 px-3 py-3">
								{@render platformChannelRows(platformChannelRowsUngrouped)}
							</div>
						</details>
					{:else}
						<div class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-3">
							{@render platformChannelRows(platformChannelRowsUngrouped)}
						</div>
					{/if}
				</div>
			{/if}
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

<CreateSocialPostModal
	bind:open={createSocialPostOpen}
	bind:presenter={createSocialPostModalPresenter}
	workspaceId={workspaceId}
	connectedChannels={connectedChannelsVm}
	uploadUid={workspaceId ?? ''}
	onScheduled={() => goToCalendar(null)}
/>

<OnBoardingModal
	open={onboardingDialogOpen}
	onOpenChange={(v) => {
		onboardingDialogOpen = v;
		if (!v) {
			markOnboardingCompleted();
			if (protectedDashboardPagePresenter.showOnboardingWelcome) {
				protectedDashboardPagePresenter.dismissOnboardingWelcome();
			}
		}
	}}
/>

<ShowChannelActionsModal
	open={channelActionsOpen}
	integration={channelActionsFor}
	workspaceId={workspaceId}
	continueSetupHref={(i) => protectedDashboardPagePresenter.continueSetupHref(i)}
	onClose={() => (channelActionsOpen = false)}
	onCreatePost={(i) => openCreatePost(i.id)}
	onMoveToGroup={openMoveGroupModal}
	onEditTimeSlots={openTimeTableModal}
	onSetDisabled={handleSetChannelDisabled}
	onRemove={handleRemoveChannel}
/>

<style>
	:global(.svar-grid-host--fit-content .wx-area),
	:global(.svar-grid-host--fit-content .wx-grid) {
		height: auto;
	}

	:global(.svar-grid-host--fit-content .wx-table-box) {
		height: auto;
		overflow: visible;
	}

	:global(.svar-grid-host--fit-content .wx-scroll) {
		flex: none;
		overflow-x: auto !important;
		overflow-y: visible !important;
	}

	:global(.svar-grid-host--body-auto-height .wx-body) {
		height: auto !important;
		overflow: visible;
	}

	:global(.wx-grid .wx-row.wx-autoheight .wx-cell) {
		align-items: flex-start;
		padding-block: 0.35rem;
	}

	.svar-grid-host--fit-content :global(.wx-willow-theme),
	.svar-grid-host--fit-content :global(.wx-willow-dark-theme) {
		--wx-color-font: var(--color-base-content);
		--wx-background: var(--color-base-100);
		--wx-background-alt: var(--color-base-200);
		--wx-border: 1px solid color-mix(in oklab, var(--color-base-content) 14%, transparent);

		--wx-table-border: var(--wx-border);
		--wx-table-header-border: var(--wx-border);
		--wx-table-header-cell-border: var(--wx-border);
		--wx-table-footer-cell-border: var(--wx-border);
		--wx-table-cell-border: var(--wx-border);

		--wx-table-header-background: color-mix(in oklab, var(--color-base-content) 12%, var(--color-base-100));
		--wx-table-select-background: color-mix(in oklab, var(--color-primary) 22%, var(--color-base-100));
		--wx-table-select-focus-background: color-mix(in oklab, var(--color-primary) 28%, var(--color-base-100));
		--wx-table-select-color: var(--color-base-content);
		--wx-table-select-border: inset 3px 0 var(--color-primary);
		--wx-table-fixed-column-right-border: 3px solid
			color-mix(in oklab, var(--color-base-content) 14%, transparent);

		--wx-table-editor-dropdown-border: var(--wx-border);
		--wx-table-editor-dropdown-shadow: 0 10px 30px
			color-mix(in oklab, var(--color-base-content) 18%, transparent);
	}

	.channels-filter-builder :global(.wx-willow-theme),
	.channels-filter-builder :global(.wx-willow-dark-theme) {
		--wx-filter-or-background: var(--color-primary);
		--wx-filter-or-font-color: var(--color-primary-content);
		--wx-filter-and-background: var(--color-accent);
		--wx-filter-and-font-color: var(--color-accent-content);
	}

	.channels-filter-builder {
		display: flex;
		justify-content: flex-end;
	}

	.channels-filter-builder :global(.wx-group.wx-line) {
		justify-content: flex-end;
		flex-wrap: wrap;
	}

	.channels-filter-builder--empty {
		flex: 0 0 0;
		width: 0;
		max-width: 0;
		min-height: 0;
		max-height: 0;
		overflow: visible;
		opacity: 0;
		pointer-events: none;
	}

	.channels-filter-builder--empty :global(.wx-rule) {
		pointer-events: auto;
	}

	.channels-filter-builder--empty :global(.wx-group.wx-line),
	.channels-filter-builder--empty :global(.wx-willow-theme) {
		background: transparent;
		padding: 0;
	}

	.channels-filter-builder :global(.wx-toolbar.wx-line .wx-button) {
		display: none;
	}

	.channels-filter-builder :global(.wx-rule .wx-menu-icon) {
		opacity: 1;
		background: var(--color-base-100);
		color: var(--color-base-content);
		border: 1px solid color-mix(in oklab, var(--color-base-content) 14%, transparent);
		box-shadow: 0 1px 0 color-mix(in oklab, var(--color-base-content) 10%, transparent);
		font-style: normal;
	}

	.channels-filter-builder :global(.wx-rule .wx-menu-icon::before) {
		content: '⋮';
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-size: 16px;
		line-height: 1;
	}
</style>