<script lang="ts">
	import type { DashboardWorkspaceCardViewModel } from '$lib/area-protected/GetDashboardWorkspaces.presenter.svelte';

	import DashboardWorkspaceCard from '$lib/ui/components/dashboard-workspaces/DashboardWorkspaceCard.svelte';
	import DashboardCreateWorkspaceCard from '$lib/ui/components/dashboard-workspaces/DashboardCreateWorkspaceCard.svelte';

	type Props = {
		cards: DashboardWorkspaceCardViewModel[];
		status: 'idle' | 'loading' | 'ready' | 'error';
		totalCount: number;
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
		creatingWorkspace = false,
		onSwitchWorkspace,
		onOpenWorkspaceSettings,
		onOpenDeveloperOAuth,
		onOpenDeveloperApiKey,
		onCreateWorkspace
	}: Props = $props();

	const workspaceCountLabel = $derived(
		totalCount === 1 ? '1 workspace' : `${totalCount} workspaces`
	);

	const showWorkspaceGrid = $derived(status === 'ready' || status === 'error');
</script>

<section class="mt-6" aria-labelledby="my-workspaces-heading">
	<div class="flex flex-wrap items-end justify-between gap-2">
		<div>
			<h2 id="my-workspaces-heading" class="text-xl font-bold text-base-content">
				My workspaces
			</h2>
			<p class="mt-1 text-sm text-base-content/60">
				{workspaceCountLabel}
			</p>
		</div>
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
				<DashboardCreateWorkspaceCard creating={creatingWorkspace} {onCreateWorkspace} />
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
					<DashboardWorkspaceCard
						{card}
						{index}
						{onSwitchWorkspace}
						{onOpenWorkspaceSettings}
						{onOpenDeveloperOAuth}
						{onOpenDeveloperApiKey}
					/>
				{/each}
				<DashboardCreateWorkspaceCard creating={creatingWorkspace} {onCreateWorkspace} />
			</div>
		{/if}
	</div>
</section>
