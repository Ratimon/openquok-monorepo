<script lang="ts">
	import type { PageData } from './$types';
	import type { IconName } from '$data/icon';
	import type { DashboardConnectedChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		getRootPathAccount,
		protectedDashboardPagePresenter
	} from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { absoluteUrl, route, url } from '$lib/utils/path';
	import { icons } from '$data/icon';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AddProvider from '$lib/ui/components/launches/AddProvider.svelte';
	import IntegrationMenu from '$lib/ui/components/launches/IntegrationMenu.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { toast } from '$lib/ui/sonner';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	let currentUser = $derived((data as App.LayoutData)?.currentUser ?? (page.data as App.LayoutData)?.currentUser ?? null);

	const accountRoot = $derived(route(getRootPathAccount()));
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const menuGroups = $derived(protectedDashboardPagePresenter.menuGroups);
	const listStatus = $derived(protectedDashboardPagePresenter.listStatus);
	
	let onboardingDialogOpen = $state(false);
	let prevOnboardingWelcome = $state(false);

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

	const iconByProvider: Record<string, IconName> = {
		facebook: icons.Facebook.name,
		instagram: icons.Instagram.name,
		youtube: icons.YouTube.name,
		tiktok: icons.TikTok.name,
		x: icons.X.name,
		threads: icons.Link.name
	};

	function providerIcon(identifier: string): IconName {
		return iconByProvider[identifier] ?? icons.Link.name;
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
			return;
		}
		void workspaceSettingsPresenter.load().then(() => {
			void protectedDashboardPagePresenter.loadConnectedIntegrations();
		});
	});
</script>

<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
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
			<h3 class="text-lg font-semibold text-base-content">Connected channels</h3>
			<AddProvider />
		</div>
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
		{:else if menuGroups.length === 0 || menuGroups.every((g) => g.items.length === 0)}
			<p class="mt-3 text-sm text-base-content/70">
				No channels yet. Use <span class="font-medium text-base-content">Add Channel</span> to connect one.
			</p>
		{:else}
			<div class="mt-4 space-y-6">
				{#each menuGroups as group (group.label)}
					<div>
						<h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
							{group.label}
						</h4>
						<ul class="grid gap-3 sm:grid-cols-2">
							{#each group.items as integration (integration.id)}
								<li>
									<IntegrationMenu
										{integration}
										workspaceId={workspaceId!}
										{providerIcon}
										{continueSetupHref}
										onRemove={handleRemoveChannel}
										onSetDisabled={handleSetChannelDisabled}
									/>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<!-- to do : refactor to component -->
<Dialog.Root bind:open={onboardingDialogOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Channel connected</Dialog.Title>
			<Dialog.Description>
				Your workspace now includes this channel. You can add more anytime or open settings to manage the workspace.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="gap-2 sm:justify-end">
			<Button
				type="button"
				variant="ghost"
				onclick={() => protectedDashboardPagePresenter.dismissOnboardingWelcome()}
			>
				Close
			</Button>
			<Button href={url(`/${getRootPathAccount()}/settings?section=workspace`)}>Workspace settings</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>