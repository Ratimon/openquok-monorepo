<script lang="ts">
	import type { HomeWorkspaceCardViewModel } from '$lib/area-protected/GetHomeWorkspaces.presenter.svelte';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import WorkspaceCard from '$lib/ui/components/workspaces/WorkspaceCard.svelte';
	import CreateWorkspaceCard from '$lib/ui/components/workspaces/CreateWorkspaceCard.svelte';

	type Props = {
		cards: HomeWorkspaceCardViewModel[];
		status: 'idle' | 'loading' | 'ready' | 'error';
		totalCount: number;
		/** Plan workspace cap; omit or pass under 1 when the tier does not enforce a limit (e.g. FREE). */
		allowedWorkspaceCount?: number | null;
		billingHref?: string;
		creatingWorkspace?: boolean;
		onSwitchWorkspace?: (workspaceId: string) => void;
		onOpenWorkspaceSettings?: (workspaceId: string) => void;
		onOpenDeveloperOAuth?: (workspaceId: string) => void;
		onOpenDeveloperApiKey?: (workspaceId: string) => void;
		onCreateWorkspace: (name: string) => Promise<{ success: boolean; message: string }>;
	};

	let {
		cards,
		status,
		totalCount,
		allowedWorkspaceCount = null,
		billingHref,
		creatingWorkspace = false,
		onSwitchWorkspace,
		onOpenWorkspaceSettings,
		onOpenDeveloperOAuth,
		onOpenDeveloperApiKey,
		onCreateWorkspace
	}: Props = $props();

	const workspaceLimit = $derived(
		allowedWorkspaceCount != null && allowedWorkspaceCount >= 1 ? allowedWorkspaceCount : null
	);

	const workspaceCountLabel = $derived(
		workspaceLimit != null ? `${totalCount}/${workspaceLimit}` : null
	);

	const isWorkspaceLimitFull = $derived(
		workspaceLimit != null && totalCount >= workspaceLimit
	);

	const showUpgradeCta = $derived(isWorkspaceLimitFull && Boolean(billingHref));

	const showWorkspaceGrid = $derived(status === 'ready' || status === 'error');
</script>

<section class="mt-6" aria-labelledby="my-workspaces-heading">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h2 id="my-workspaces-heading" class="text-xl font-bold text-base-content">
			My workspaces
			{#if workspaceCountLabel}
				<span class={isWorkspaceLimitFull ? 'text-warning' : 'text-base-content/70'}>
					({workspaceCountLabel})
				</span>
			{/if}
		</h2>
		{#if showUpgradeCta && billingHref}
			<Button href={billingHref}
				variant="outline"
				size="sm" class="gap-1.5"
			>
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
		{:else if status === 'error' && cards.length === 0}
			<p class="text-sm text-error">
				Could not load workspace details. Refresh the page to try again.
			</p>
			<div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				<CreateWorkspaceCard creating={creatingWorkspace} {onCreateWorkspace} />
			</div>
		{:else if showWorkspaceGrid}
			{#if status === 'error'}
				<p class="mb-3 text-sm text-error">
					Some workspace details could not be loaded. Cards may be incomplete.
				</p>
			{/if}
			{#if cards.length === 0}
				<p class="mb-4 text-sm text-base-content/70">
					You do not have a workspace yet. Create one to connect channels and schedule posts.
				</p>
			{/if}
			<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{#each cards as card, index (card.id)}
					<WorkspaceCard
						{card}
						{index}
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
		{/if}
	</div>
</section>
