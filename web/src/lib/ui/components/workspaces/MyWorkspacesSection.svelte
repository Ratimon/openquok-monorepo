<script lang="ts">
	import type { HomeWorkspaceCardViewModel } from '$lib/area-protected/GetHomeWorkspaces.presenter.svelte';
	import type { PendingInviteViewModel } from '$lib/settings/WorkspaceSettings.presenter.svelte';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import HomeAccountNoticeBanner from '$lib/ui/components/home/HomeAccountNoticeBanner.svelte';
	import WorkspaceCard from '$lib/ui/components/workspaces/WorkspaceCard.svelte';
	import PendingInviteWorkspaceCard from '$lib/ui/components/workspaces/PendingInviteWorkspaceCard.svelte';
	import CreateWorkspaceCard from '$lib/ui/components/workspaces/CreateWorkspaceCard.svelte';

	type Props = {
		cardsVm: HomeWorkspaceCardViewModel[];
		status: 'idle' | 'loading' | 'ready' | 'error';
		/** Owned workspace count for plan cap display; defaults to owner cards when omitted. */
		ownedWorkspaceCount?: number;
		/** Plan workspace cap; omit or pass under 1 when the tier does not enforce a limit (e.g. FREE). */
		allowedWorkspaceCount?: number | null;
		/** Per-workspace team member cap from the current plan; omit when unlimited or not enforced. */
		allowedMemberCountPerWorkspace?: number | null;
		billingHref?: string;
		creatingWorkspace?: boolean;
		onSwitchWorkspace?: (workspaceId: string) => void;
		onOpenWorkspaceSettings?: (workspaceId: string) => void;
		onOpenDeveloperOAuth?: (workspaceId: string) => void;
		onOpenDeveloperApiKey?: (workspaceId: string) => void;
		onCreateWorkspace: (name: string) => Promise<{ success: boolean; message: string }>;
		pendingInvitesVm?: PendingInviteViewModel[];
		loadingPendingInvites?: boolean;
		acceptingInviteId?: string | null;
		onAcceptPendingInvite?: (inviteId: string) => Promise<{ success: boolean; message: string }>;
		/** `stack` — vertical rail; `grid` — responsive card grid (default). */
		layout?: 'grid' | 'stack';
		/** Smaller section title and spacing (e.g. home left rail). */
		compactSection?: boolean;
	};

	let {
		cardsVm,
		status,
		ownedWorkspaceCount,
		allowedWorkspaceCount = null,
		allowedMemberCountPerWorkspace = null,
		billingHref,
		creatingWorkspace = false,
		onSwitchWorkspace,
		onOpenWorkspaceSettings,
		onOpenDeveloperOAuth,
		onOpenDeveloperApiKey,
		onCreateWorkspace,
		pendingInvitesVm = [],
		loadingPendingInvites = false,
		acceptingInviteId = null,
		onAcceptPendingInvite,
		layout = 'grid',
		compactSection = false
	}: Props = $props();

	const isStackLayout = $derived(layout === 'stack');

	const cardsContainerClass = $derived(
		isStackLayout ? 'flex flex-col gap-4' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
	);

	const ownerCards = $derived(cardsVm.filter((c) => c.workspaceRole === 'owner'));
	const sharedCards = $derived(cardsVm.filter((c) => c.workspaceRole !== 'owner'));

	const ownedCount = $derived(ownedWorkspaceCount ?? ownerCards.length);

	const workspaceLimit = $derived(
		allowedWorkspaceCount != null && allowedWorkspaceCount >= 1 ? allowedWorkspaceCount : null
	);

	const workspaceCountLabel = $derived(
		workspaceLimit != null ? `${ownedCount}/${workspaceLimit}` : null
	);

	const isWorkspaceLimitFull = $derived(
		workspaceLimit != null && ownedCount >= workspaceLimit
	);

	const showUpgradeCta = $derived(isWorkspaceLimitFull && Boolean(billingHref));

	const showWorkspaceGrid = $derived(status === 'ready' || status === 'error');

	const showSharedSection = $derived(
		sharedCards.length > 0 || pendingInvitesVm.length > 0 || loadingPendingInvites
	);

	const workspacesHeadingClass = $derived(
		isStackLayout
			? 'text-lg font-semibold text-base-content sm:text-xl'
			: compactSection
				? 'text-base font-bold text-base-content'
				: 'text-xl font-bold text-base-content'
	);
</script>

<section
	class={isStackLayout ? '' : compactSection ? 'mt-4' : 'mt-6'}
	aria-labelledby="my-workspaces-heading"
>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h2 id="my-workspaces-heading" class={workspacesHeadingClass}>
			My workspaces
			{#if workspaceCountLabel}
				<span class={isWorkspaceLimitFull ? 'text-warning' : 'text-base-content/70'}>
					({workspaceCountLabel})
				</span>
			{/if}
		</h2>
		{#if showUpgradeCta && billingHref && showWorkspaceGrid}
			<Button href={billingHref} variant="outline" size="sm" class="gap-1.5">
				<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
				Upgrade plan
			</Button>
		{/if}
	</div>

	<div class="mt-4">
		{#if status === 'loading' || status === 'idle'}
			<p class="text-sm text-base-content/70">
				Loading workspaces…
			</p>
		{:else if status === 'error' && cardsVm.length === 0}
			<p class="text-sm text-error">
				Could not load workspace details. Refresh the page to try again.
			</p>
			<div class="mt-4 {cardsContainerClass}">
				<CreateWorkspaceCard creating={creatingWorkspace} {onCreateWorkspace} />
			</div>
		{:else if showWorkspaceGrid}
			{#if status === 'error'}
				<p class="mb-3 text-sm text-error">
					Some workspace details could not be loaded. Cards may be incomplete.
				</p>
			{/if}

			<section class="space-y-4">
				{#if isStackLayout}
					<HomeAccountNoticeBanner
						iconName={icons.Info.name}
						tone="neutral"
						dismissible={true}
					>
						<p class="text-sm text-base-content/90">
							<span class="font-medium text-base-content">One workspace = one context.</span>
							Use separate workspaces for different brands or clients to keep AI context focused.
						</p>
					</HomeAccountNoticeBanner>
				{:else}
					<HomeAccountNoticeBanner
						iconName={icons.Info.name}
						tone="neutral"
						dismissible={true}
					>
						<p class="font-medium text-base-content">One workspace = one context</p>
						<p class="mt-1 text-base-content/90">
							Workspaces exist to keep the context focused. Connecting too many social
							channels or installing too many skills can cause context rot and hallucinations.
							Use separate workspaces for different brands, or clients.
						</p>
					</HomeAccountNoticeBanner>
				{/if}

				{#if ownerCards.length === 0}
					<p class="text-sm text-base-content/70">
						You do not have a workspace yet. Create one to connect channels and schedule posts.
					</p>
				{:else}
					<p class="text-sm text-base-content/70">
						You own {ownerCards.length} workspace{ownerCards.length === 1 ? '' : 's'} — you manage
						billing, invites, and plan limits.
					</p>
				{/if}

				<div class={cardsContainerClass}>
					{#each ownerCards as card, index (card.id)}
						<WorkspaceCard
							{card}
							{index}
							allowedMemberCount={allowedMemberCountPerWorkspace}
							actionsLayout={isStackLayout ? 'column' : 'row'}
							channelPreviewLayout={isStackLayout ? 'wrap' : 'overlap'}
							{onSwitchWorkspace}
							{onOpenWorkspaceSettings}
							{onOpenDeveloperOAuth}
							{onOpenDeveloperApiKey}
						/>
					{/each}
					<CreateWorkspaceCard
						creating={creatingWorkspace}
						locked={isWorkspaceLimitFull}
						upgradeHref={billingHref}
						{onCreateWorkspace}
					/>
				</div>
			</section>

			{#if showSharedSection}
				<section
					class="{compactSection ? 'mt-6' : 'mt-8'} space-y-4"
					aria-labelledby="shared-workspaces-heading"
				>
					<h3
						id="shared-workspaces-heading"
						class="{compactSection ? 'text-sm' : 'text-base'} font-semibold text-base-content"
					>
						Shared with you
					</h3>
					<p class="text-sm text-base-content/70">
						Workspaces you have joined, plus invitations waiting for your response.
					</p>
					{#if loadingPendingInvites && pendingInvitesVm.length === 0 && sharedCards.length === 0}
						<p class="text-sm text-base-content/70">Loading invites…</p>
					{/if}
					<div class={cardsContainerClass}>
						{#each pendingInvitesVm as invite, index (`invite-${invite.id}`)}
							<PendingInviteWorkspaceCard
								{invite}
								{index}
								accepting={acceptingInviteId === invite.id}
								disabled={acceptingInviteId !== null && acceptingInviteId !== invite.id}
								onAccept={(inviteId) => {
									void onAcceptPendingInvite?.(inviteId);
								}}
							/>
						{/each}
						{#each sharedCards as card, index (card.id)}
							<WorkspaceCard
								{card}
								{index}
								variant="compact"
								actionsLayout={isStackLayout ? 'column' : 'row'}
								channelPreviewLayout={isStackLayout ? 'wrap' : 'overlap'}
								{onSwitchWorkspace}
								{onOpenWorkspaceSettings}
								{onOpenDeveloperOAuth}
								{onOpenDeveloperApiKey}
							/>
						{/each}
					</div>
				</section>
			{/if}
		{/if}
	</div>
</section>
