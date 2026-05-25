<script lang="ts">
	import type { WorkspaceCardViewModel } from '$lib/settings/GetWorkspace.presenter.svelte';

	import { icons } from '$data/icons';

	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import { cn } from '$lib/ui/helpers/common';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';

	type SwitchWorkspaceModalData = {
		workspaceId: string;
		workspaceName: string;
	};

	type Props = {
		workspaces: WorkspaceCardViewModel[];
		currentWorkspaceId: string | null;
		loading?: boolean;
		onSwitchWorkspace?: (workspaceId: string) => void;
	};

	let {
		workspaces,
		currentWorkspaceId,
		loading = false,
		onSwitchWorkspace
	}: Props = $props();

	let switchModalOpen = $state(false);
	let pendingSwitch = $state<SwitchWorkspaceModalData | null>(null);

	const currentWorkspace = $derived(
		workspaces.find((workspace) => workspace.id === currentWorkspaceId) ?? null
	);

	const switchableWorkspaces = $derived(
		workspaces.filter((workspace) => workspace.id !== currentWorkspaceId && !workspace.disabled)
	);

	const workspaceInitial = $derived(
		(currentWorkspace?.name || 'W').trim().slice(0, 1).toUpperCase()
	);

	const triggerLabel = $derived(
		loading && !currentWorkspace ? 'Workspace…' : (currentWorkspace?.name ?? 'Workspace')
	);

	const switchWorkspaceModalData = $derived<SwitchWorkspaceModalData | null>(pendingSwitch);

	function requestSwitchWorkspace(workspace: WorkspaceCardViewModel) {
		if (!onSwitchWorkspace || workspace.id === currentWorkspaceId || workspace.disabled) return;
		pendingSwitch = { workspaceId: workspace.id, workspaceName: workspace.name };
		switchModalOpen = true;
	}

	$effect(() => {
		if (!switchModalOpen) pendingSwitch = null;
	});

	async function executeSwitchWorkspace(
		data: unknown
	): Promise<{ success: boolean; message: string }> {
		if (!onSwitchWorkspace) {
			return { success: false, message: 'Unable to switch workspace.' };
		}
		const { workspaceId, workspaceName } = data as SwitchWorkspaceModalData;
		onSwitchWorkspace(workspaceId);
		return { success: true, message: `Switched to ${workspaceName}` };
	}
</script>

{#if workspaces.length > 0 || loading}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			aria-label="Switch workspace"
			disabled={loading && !currentWorkspace}
			class={cn(
				'hidden sm:inline-flex h-8 max-w-[12rem] items-center gap-2 rounded-md border border-base-300 bg-base-100 px-2.5 text-sm font-medium text-base-content shadow-sm outline-none hover:bg-base-content/10 focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50'
			)}
		>
			<span
				class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
				aria-hidden="true"
			>
				{workspaceInitial}
			</span>
			<span class="truncate">{triggerLabel}</span>
			<AbstractIcon
				name={icons.ChevronDown.name}
				class="size-3.5 shrink-0 text-base-content/60"
				width="14"
				height="14"
				focusable="false"
			/>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" sideOffset={6} class="min-w-[14rem] max-w-[18rem]">
			<DropdownMenu.Label class="text-xs text-base-content/60">Workspaces</DropdownMenu.Label>
			{#each workspaces as workspace (workspace.id)}
				{@const isCurrent = workspace.id === currentWorkspaceId}
				<DropdownMenu.Item
					disabled={workspace.disabled || isCurrent}
					onclick={() => requestSwitchWorkspace(workspace)}
					class={cn(isCurrent && 'bg-base-200/80')}
				>
					<span class="truncate">{workspace.name}</span>
					{#if isCurrent}
						<AbstractIcon
							name={icons.Check.name}
							class="ms-auto size-4 shrink-0 text-primary"
							width="16"
							height="16"
							focusable="false"
						/>
					{/if}
				</DropdownMenu.Item>
			{/each}
			{#if !loading && switchableWorkspaces.length === 0 && workspaces.length === 1}
				<DropdownMenu.Label class="text-xs font-normal text-base-content/50">
					No other workspaces
				</DropdownMenu.Label>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	{#if onSwitchWorkspace && switchWorkspaceModalData}
		<ActionVerificationModal
			data={switchWorkspaceModalData}
			bind:open={switchModalOpen}
			executionFunction={executeSwitchWorkspace}
			buttonIconName={icons.ArrowRight.name}
			buttonText="Switch workspace"
			modalTitle="Switch workspace"
			modalDescription={`You are about to open "${switchWorkspaceModalData.workspaceName}". Your home, channels, posts, your API keys will reflect that workspace.`}
			modalVerficationWithAnswer={false}
		/>
	{/if}
{/if}
