<script lang="ts">
	import type { PageData } from './$types';
	import type { IconName } from '$data/icon';
	import type {
		DashboardConnectedChannelViewModel,
		DashboardPlatformChannelRowViewModel
	} from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount, protectedDashboardPagePresenter } from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { absoluteUrl, route, url } from '$lib/utils/path';
	import { icons } from '$data/icon';

	import { Alert, AlertDescription, AlertTitle } from '$lib/ui/alert';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AddProvider from '$lib/ui/components/launches/AddProvider.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import IntegrationMenu from '$lib/ui/components/launches/IntegrationMenu.svelte';
	import MoveChannelGroupModal from '$lib/ui/components/launches/MoveChannelGroupModal.svelte';
	import OnBoardingModal from '$lib/ui/components/launches/OnBoardingModal.svelte';
	import { toast } from '$lib/ui/sonner';

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
	const connectedChannelCount = $derived(protectedDashboardPagePresenter.connectedChannels.length);

	let groupDetailsOpen = $state<Record<string, boolean>>({});
	let moveGroupOpen = $state(false);
	let moveGroupFor = $state<DashboardConnectedChannelViewModel | null>(null);

	function openMoveGroupModal(integration: DashboardConnectedChannelViewModel) {
		moveGroupFor = integration;
		moveGroupOpen = true;
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
		const connectPath = `${accountRoot}/integrations/social/${encodeURIComponent(identifier)}`;
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

	function continueSetupHref(integration: DashboardConnectedChannelViewModel): string {
		if (!workspaceId) return url(`/${getRootPathAccount()}`);
		if (integration.identifier === 'instagram-business') {
			const qs = new URLSearchParams({
				organizationId: workspaceId,
				integrationId: integration.id,
				returnTo: accountRoot
			});
			return absoluteUrl(`${accountRoot}/integrations/instagram-business?${qs}`);
		}
		const qs = new URLSearchParams({
			organizationId: workspaceId,
			returnTo: accountRoot,
			refresh: integration.internalId
		});
		return absoluteUrl(`${accountRoot}/integrations/social/${encodeURIComponent(integration.identifier)}?${qs}`);
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

	$effect(() => {
		if (workspaceId) {
			void protectedDashboardPagePresenter.loadConnectedIntegrations();
			void protectedDashboardPagePresenter.loadChannelGroups();
			return;
		}
		void workspaceSettingsPresenter.load().then(() => {
			void protectedDashboardPagePresenter.loadConnectedIntegrations();
			void protectedDashboardPagePresenter.loadChannelGroups();
		});
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
							name={providerIcon(row.identifier)}
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
									{providerIcon}
									{continueSetupHref}
									onRemove={handleRemoveChannel}
									onSetDisabled={handleSetChannelDisabled}
									onMoveToGroup={openMoveGroupModal}
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
			
			<!-- `onboarding={true}`: 9-column grid + `?onboarding=true` on OAuth (match reference “onboarding” mode). -->
			<AddProvider />
		</div>

		{#if workspaceId && listStatus !== 'loading'}
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
						Multiple accounts on the same platform
					</AlertTitle>
					<AlertDescription class="leading-relaxed text-neutral-900">
						You can connect more than one account per platform. Before you use
						<span class="font-semibold text-neutral-950">Add Channel</span> or
						<span class="font-semibold text-neutral-950">Add more</span> for a different login,
						sign out of that service in your browser. Otherwise the
						provider may reuse the session for the account you connected last.
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
			<p class="mt-3 text-sm text-base-content/70">
				No channels yet. Use <span class="font-medium text-base-content">Add Channel</span> to connect one.
			</p>
		{:else}
			{#if channelGroupSections.length > 0}
				<div class="mt-4 space-y-2">
					<h4 class="text-sm font-semibold text-base-content/80">Groups</h4>
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
								<span class="font-medium text-base-content">{group.name}</span>
							</summary>
							<div class="border-t border-base-300 px-3 py-3">
								{@render platformChannelRows(group.platformRows)}
							</div>
						</details>
					{/each}
				</div>
			{/if}
			<div class="mt-4">
				{@render platformChannelRows(platformChannelRowsUngrouped)}
			</div>
		{/if}
	</section>
</div>

<MoveChannelGroupModal bind:open={moveGroupOpen} integration={moveGroupFor} />

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