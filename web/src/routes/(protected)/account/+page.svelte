<script lang="ts">
	import type { PageData } from './$types';
	import type {
		CreateSocialPostChannelViewModel,
		DashboardPlatformChannelRowViewModel
	} from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount, protectedDashboardPagePresenter } from '$lib/area-protected';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { toast } from '$lib/ui/sonner';

	/** Same singleton as on the page presenter; `bind:presenter` cannot target an import binding. */
	let createPostPresenter = $state.raw(protectedDashboardPagePresenter.createSocialPostPresenter);
	import { absoluteUrl, route, url } from '$lib/utils/path';
	import { icons } from '$data/icon';

	import { Alert, AlertDescription, AlertTitle } from '$lib/ui/alert';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AddProvider from '$lib/ui/components/posts/AddProvider.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';
	import MoveChannelGroupModal from '$lib/ui/components/posts/MoveChannelGroupModal.svelte';
	import TimeTable from '$lib/ui/components/posts/TimeTable.svelte';
	import OnBoardingModal from '$lib/ui/components/posts/OnBoardingModal.svelte';
	import { CALENDAR_UNGROUPED_SENTINEL } from '$lib/posts';
	import { socialProviderIcon } from '$lib/posts/constants/socialProviderIcons';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	let currentUser = $derived((data as App.LayoutData)?.currentUser ?? (page.data as App.LayoutData)?.currentUser ?? null);

	const accountRoot = $derived(route(getRootPathAccount()));
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const platformChannelRowsUngrouped = $derived(protectedDashboardPagePresenter.platformChannelRowsUngrouped);
	const channelGroupSections = $derived(protectedDashboardPagePresenter.channelGroupSections);
	const listStatus = $derived(protectedDashboardPagePresenter.listStatus);
	const connectedChannelsVm = $derived(protectedDashboardPagePresenter.connectedChannelsVm);
	const connectedChannelCount = $derived(connectedChannelsVm.length);

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
			connectedChannelCount === 1 &&
			!hasSocialPlatformWithMultipleChannels
	);

	let groupDetailsOpen = $state<Record<string, boolean>>({});
	let ungroupedDetailsOpen = $state(true);
	let moveGroupOpen = $state(false);
	let moveGroupFor = $state<CreateSocialPostChannelViewModel | null>(null);

	let timeTableOpen = $state(false);
	let timeTableFor = $state<CreateSocialPostChannelViewModel | null>(null);

	let createSocialPostOpen = $state(false);

	function openCreatePost(preselectIntegrationId: string | null) {
		protectedDashboardPagePresenter.createSocialPostPresenter.prepareOpen({
			preselectIntegrationId,
			preselectGroupId: null
		});
		createSocialPostOpen = true;
	}

	function openCreatePostForGroup(groupId: string) {
		protectedDashboardPagePresenter.createSocialPostPresenter.prepareOpen({
			preselectIntegrationId: null,
			preselectGroupId: groupId,
			autoCustomizeFirstSelected: true
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
		timeTableFor = integration;
		timeTableOpen = true;
	}

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
			timeTableFor = null;
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
		const hasAnyChannels = connectedChannelCount > 0;
		if (hasAnyChannels) return;
		if (isOnboardingCompleted()) return;
		onboardingDialogOpen = true;
		hasAutoOpenedOnboarding = true;
	});

	/** Short label for “Add more …” copy (matches connect flow naming where listed). */
	const providerAddMoreLabelById: Record<string, string> = {
		threads: 'Threads',
		'instagram-business': 'Instagram (Business)',
		'instagram-standalone': 'Instagram (Standalone)',
		facebook: 'Facebook',
		youtube: 'YouTube',
		tiktok: 'TikTok',
		x: 'X'
	};

	function providerAddMoreLabel(identifier: string): string {
		const key = identifier.trim();
		if (providerAddMoreLabelById[key]) return providerAddMoreLabelById[key];
		return key
			.split('-')
			.filter(Boolean)
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join(' ');
	}

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
		const r = await protectedDashboardPagePresenter.removeChannel(id);
		if (r.ok) {
			toast.success('Channel removed.');
			return true;
		}
		toast.error(r.error);
		return false;
	}

	async function handleSetChannelDisabled(id: string, disabled: boolean): Promise<boolean> {
		const r = await protectedDashboardPagePresenter.setChannelDisabled(id, disabled);
		if (r.ok) {
			toast.success(disabled ? 'Channel disabled.' : 'Channel enabled.');
			return true;
		}
		toast.error(r.error);
		return false;
	}

	function continueSetupHref(integration: CreateSocialPostChannelViewModel): string {
		if (!workspaceId) return url(`/${getRootPathAccount()}`);
		if (integration.identifier === 'instagram-business') {
			const qs = new URLSearchParams({
				organizationId: workspaceId,
				integrationId: integration.id,
				returnTo: accountRoot
			});
			return absoluteUrl(`${integrationOAuthCallbackPath('instagram-business')}?${qs}`);
		}
		const qs = new URLSearchParams({
			organizationId: workspaceId,
			returnTo: accountRoot,
			refresh: integration.internalId
		});
		return absoluteUrl(`${integrationOAuthCallbackPath(integration.identifier)}?${qs}`);
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

	// Workspace is loaded by account `+layout` (`afterNavigate` → dock refresh → `workspaceSettingsPresenter.load()`).
	// Only react to `workspaceId` here — do not call `load()` then branch again, or list/customers fire twice per navigation.
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
									{continueSetupHref}
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
						variant="outline"
						size="sm"
						class="shrink-0 gap-1.5 border-base-300"
						onclick={() => startAddAnotherChannel(row.identifier)}
					>
						<AbstractIcon name={icons.Plus.name} class="h-4 w-4" width="16" height="16" />
						Add more {providerAddMoreLabel(row.identifier)}
					</Button>
				</div>
			{/each}
		</div>
	{/snippet}

	<h2 class="text-2xl font-bold text-base-content">Account dashboard</h2>
	<p class="mt-2 text-base-content/80">
		Welcome to your account. Connect channels for the selected workspace and manage them here.
	</p>
	{#if currentUser}
		<dl class="mt-6 grid gap-2 text-sm sm:grid-cols-2">
			<div class="contents">
				<dt class="font-medium text-base-content/70">Email</dt>
				<dd class="text-base-content">{currentUser.email}</dd>
			</div>
			<div class="contents">
				<dt class="font-medium text-base-content/70">Full name</dt>
				<dd class="text-base-content">{currentUser.fullName ?? '—'}</dd>
			</div>
			<div class="contents">
				<dt class="font-medium text-base-content/70">Username</dt>
				<dd class="text-base-content">{currentUser.username ?? '—'}</dd>
			</div>
		</dl>
	{/if}

	<section class="mt-8">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h3 class="text-lg font-semibold text-base-content">
				Connected channels
			</h3>

			<div class="flex flex-wrap items-center justify-end gap-2">
				{#if connectedChannelCount >= 1}
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
					hasConnectedChannels={connectedChannelCount >= 1}
				/>
				<AddProvider
					invite
					iconOnly
					iconOnlyTooltip="Send Invite Link to connect channel"
					hasConnectedChannels={connectedChannelCount >= 1}
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
				<a class="link link-primary" href={url(`/${getRootPathAccount()}/settings?section=workspace`)}>settings</a>
				to load channels.
			</p>
		{:else if listStatus === 'loading'}
			<p class="mt-4 flex items-center gap-2 text-sm text-base-content/70">
				<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
				Loading channels…
			</p>
		{:else if listStatus === 'error'}
			<p class="mt-3 text-sm text-error">Could not load channels. Try again in a moment.</p>
		{:else if connectedChannelCount === 0}
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
		{:else}
			{#if channelGroupSections.length > 0}
				<div class="mt-4 space-y-2">
					<h4 class="text-sm font-semibold text-base-content/80">
						Grouped channels
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
							Ungrouped channels
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

<MoveChannelGroupModal bind:open={moveGroupOpen} integration={moveGroupFor} />

<TimeTable bind:open={timeTableOpen} integration={timeTableFor} />

<CreateSocialPostModal
	bind:open={createSocialPostOpen}
	bind:presenter={createPostPresenter}
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