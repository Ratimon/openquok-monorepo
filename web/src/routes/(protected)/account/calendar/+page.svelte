<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { page } from '$app/state';
	import { toast } from '$lib/ui/sonner';
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';

	import {
		getRootPathAccount,
		protectedCalendarPagePresenter,
		protectedDashboardPagePresenter
	} from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { stripHtmlToPlainText } from '$lib/utils/stripHtml';
	import { postsRepository } from '$lib/posts';
	import { socialProviderIcon } from '$lib/posts/constants/socialProviderIcons';

	import Scheduler from '$lib/ui/components/calendar-scheduler/Scheduler.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';
	import MoveChannelGroupModal from '$lib/ui/components/posts/MoveChannelGroupModal.svelte';
	import TimeTable from '$lib/ui/components/posts/TimeTable.svelte';

	const calendarPresenter = protectedCalendarPagePresenter;

	/** Same singleton as on the calendar page presenter; `bind:presenter` cannot target an import binding. */
	let createPostPresenter = $state.raw(calendarPresenter.createSocialPostPresenter);

	let createSocialPostOpen = $state(false);

	let moveGroupOpen = $state(false);
	let moveGroupFor = $state<CreateSocialPostChannelViewModel | null>(null);

	let timeTableOpen = $state(false);
	let timeTableFor = $state<CreateSocialPostChannelViewModel | null>(null);

	let actionsOpen = $state(false);
	let actionsPostGroup = $state<string | null>(null);
	let actionsBusy = $state(false);
	let actionsHeaderLoading = $state(false);
	let actionsHeaderError = $state<string | null>(null);
	let actionsSummary = $state<{
		channelPicture?: string;
		channelName?: string;
		channelIdentifier?: string;
		publishDateIso?: string;
		status?: string;
		content?: string;
		channelCount?: number;
	} | null>(null);
	let actionsLoadToken = 0;

	const accountRoot = route(getRootPathAccount());
	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const connectedChannelsVm = $derived(protectedDashboardPagePresenter.connectedChannelsVm);
	const listStatus = $derived(protectedDashboardPagePresenter.listStatus);
	const channelsLoadPending = $derived(listStatus === 'idle' || listStatus === 'loading');

	const targetedChannelsVm = $derived(calendarPresenter.targetedChannelsVm);
	const calendarRefreshKey = $derived(calendarPresenter.calendarRefreshKey);

	const groupId = $derived(page.url.searchParams.get('groupId'));

	function goBackToAccount() {
		void goto(accountRoot);
	}

	function openCreatePostForCurrentScope() {
		openCreatePostForCurrentScopeAtIso(null);
	}

	function openCreatePostForCurrentScopeAtIso(preselectScheduledAtIso: string | null) {
		const r = calendarPresenter.getCreatePostPrepareOpenOptions();
		if (!r.ok) {
			toast.error(r.error);
			return;
		}
		calendarPresenter.createSocialPostPresenter.prepareOpen({
			...r.options,
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

	function openActionsForPostGroup(postGroup: string) {
		if (!postGroup) return;
		actionsPostGroup = postGroup;
		actionsHeaderLoading = true;
		actionsHeaderError = null;
		actionsSummary = null;
		actionsOpen = true;

		const token = ++actionsLoadToken;
		void (async () => {
			try {
				const r = await postsRepository.getPostGroup(postGroup);
				if (token !== actionsLoadToken) return;
				if (!r.ok) {
					actionsHeaderError = r.error;
					return;
				}
				const g = r.group;
				const firstIntegrationId = g.integrationIds?.[0] ?? null;
				const ch = firstIntegrationId ? connectedChannelsVm.find((x) => x.id === firstIntegrationId) : null;
				actionsSummary = {
					channelPicture: ch?.picture ?? undefined,
					channelName: ch?.name ?? undefined,
					channelIdentifier: ch?.identifier ?? undefined,
					publishDateIso: g.publishDateIso ?? undefined,
					status: g.status ? String(g.status).toUpperCase() : undefined,
					content: stripHtmlToPlainText(String(g.body ?? '')).trim(),
					channelCount: Array.isArray(g.integrationIds) ? g.integrationIds.length : 0
				};
			} finally {
				if (token === actionsLoadToken) actionsHeaderLoading = false;
			}
		})();
	}

	function closeActions() {
		actionsOpen = false;
		actionsPostGroup = null;
		actionsBusy = false;
		actionsHeaderLoading = false;
		actionsHeaderError = null;
		actionsSummary = null;
	}

	function formatLocalDateTime(iso: string | undefined): { date: string; time: string } {
		if (!iso) return { date: '', time: '' };
		const ms = Date.parse(iso);
		if (!Number.isFinite(ms)) return { date: '', time: '' };
		const d = new Date(ms);
		return {
			date: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
			time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		};
	}

	async function copyPostGroupText() {
		const pg = actionsPostGroup;
		if (!pg) return;
		actionsBusy = true;
		try {
			const r = await postsRepository.getPostGroup(pg);
			if (!r.ok) {
				toast.error(r.error);
				return;
			}
			const plain = stripHtmlToPlainText(r.group.body ?? '');
			await navigator.clipboard.writeText(plain);
			toast.success('Copied to clipboard.');
		} catch {
			toast.error('Could not copy to clipboard.');
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
			const r = await postsRepository.deletePostGroup(pg);
			if (r.ok) {
				toast.success('Post deleted.');
				calendarPresenter.bumpCalendarRefresh();
				closeActions();
				return;
			}
			toast.error(r.error);
		} finally {
			actionsBusy = false;
		}
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
		const r = await calendarPresenter.removeChannel(id);
		if (r.ok) {
			toast.success('Channel removed.');
			return true;
		}
		toast.error(r.error);
		return false;
	}

	async function handleSetChannelDisabled(id: string, disabled: boolean): Promise<boolean> {
		const r = await calendarPresenter.setChannelDisabled(id, disabled);
		if (r.ok) {
			toast.success(disabled ? 'Channel disabled.' : 'Channel enabled.');
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

<Dialog.Root bind:open={actionsOpen} onOpenChange={(o) => (!o ? closeActions() : null)}>
	<Dialog.Content class="max-w-sm p-0" showCloseButton={true}>
		<div class="border-b border-base-300 px-4 py-3">
			<div class="text-base font-semibold text-base-content">Post actions</div>

			{#if actionsHeaderLoading}
				<div class="mt-2 flex items-center gap-2 text-xs text-base-content/60">
					<AbstractIcon name={icons.LoaderCircle.name} class="h-3.5 w-3.5 animate-spin" width="14" height="14" />
					Loading post…
				</div>
			{:else if actionsHeaderError}
				<div class="mt-2 text-xs text-error">{actionsHeaderError}</div>
			{:else if actionsSummary}
				{@const dt = formatLocalDateTime(actionsSummary.publishDateIso)}
				{@const iconName = socialProviderIcon(actionsSummary.channelIdentifier)}
				<div class="mt-2 flex items-start gap-3">
					<div class="relative h-9 w-9 shrink-0">
						{#if actionsSummary.channelPicture}
							<img src={actionsSummary.channelPicture} alt="" class="h-9 w-9 rounded-md object-cover" />
						{:else}
							<div class="flex h-9 w-9 items-center justify-center rounded-md bg-base-200 text-[10px] font-semibold text-base-content/60">
								{(actionsSummary.channelName || 'CH').slice(0, 2).toUpperCase()}
							</div>
						{/if}
						{#if actionsSummary.channelIdentifier}
							<span
								class="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-base-100 text-base-content shadow-sm ring-1 ring-base-300"
								aria-hidden="true"
							>
								<AbstractIcon name={iconName} class="size-3.5" width="14" height="14" />
							</span>
						{/if}
					</div>

					<div class="min-w-0 flex-1">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0">
								<div class="truncate text-xs font-semibold text-base-content/70">
									{actionsSummary.channelName || 'Channel'}
									{#if (actionsSummary.channelCount ?? 0) > 1}
										<span class="ml-1 text-[11px] font-semibold text-base-content/50">
											+{(actionsSummary.channelCount ?? 0) - 1}
										</span>
									{/if}
								</div>
								<div class="mt-0.5 text-xs text-base-content/55">
									{#if dt.date || dt.time}
										{dt.date}{dt.time ? ` · ${dt.time}` : ''}
									{:else}
										Draft
									{/if}
								</div>
							</div>
							{#if actionsSummary.status}
								<div class="shrink-0 rounded bg-base-200 px-2 py-0.5 text-[11px] font-semibold text-base-content/70">
									{actionsSummary.status}
								</div>
							{/if}
						</div>
						<div class="mt-2 line-clamp-2 text-sm font-medium leading-snug text-base-content/90">
							{actionsSummary.content || 'No content'}
						</div>
					</div>
				</div>
			{/if}
		</div>
		<div class="p-2">
			<button
				type="button"
				class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
				disabled={actionsBusy || !actionsPostGroup}
				onclick={() => {
					const pg = actionsPostGroup;
					if (!pg) return;
					closeActions();
					openEditPostGroup(pg);
				}}
			>
				<AbstractIcon name={icons.Pencil.name} class="size-4 shrink-0" width="16" height="16" />
				Edit
			</button>
			<button
				type="button"
				class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
				disabled={actionsBusy || !actionsPostGroup}
				onclick={() => void copyPostGroupText()}
			>
				<AbstractIcon name={icons.Copy.name} class="size-4 shrink-0" width="16" height="16" />
				Copy
			</button>
			<button
				type="button"
				class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
				disabled={actionsBusy}
				onclick={() => toast.message('Preview is coming soon.')}
			>
				<AbstractIcon name={icons.Eye.name} class="size-4 shrink-0" width="16" height="16" />
				Preview
			</button>
			<button
				type="button"
				class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
				disabled={actionsBusy}
				onclick={() => toast.message('Statistics is coming soon.')}
			>
				<AbstractIcon name={icons.ChartBar.name} class="size-4 shrink-0" width="16" height="16" />
				Statistics
			</button>
			<div class="bg-base-300 my-2 h-px w-full"></div>
			<button
				type="button"
				class="hover:bg-error/10 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start text-error outline-none disabled:opacity-50"
				disabled={actionsBusy || !actionsPostGroup}
				onclick={() => void deletePostGroup()}
			>
				<AbstractIcon name={icons.Trash.name} class="size-4 shrink-0" width="16" height="16" />
				Delete
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>

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
