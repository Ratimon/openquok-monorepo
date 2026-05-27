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
		/** Shown in the title when the active workspace is not in `workspaces`. */
		displayName: string;
		onSwitchWorkspace?: (workspaceId: string) => void;
	};

	let { workspaces, currentWorkspaceId, displayName, onSwitchWorkspace }: Props = $props();

	let switchModalOpen = $state(false);
	let pendingSwitch = $state<SwitchWorkspaceModalData | null>(null);

	const currentInList = $derived(
		workspaces.find((workspace) => workspace.id === currentWorkspaceId) ?? null
	);

	const triggerLabel = $derived(currentInList?.name ?? displayName);

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

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		aria-label="Select workspace for billing"
		class={cn(
			'inline-flex max-w-full items-center gap-1.5 rounded-md px-1 py-0.5 -ms-1 align-baseline',
			'text-2xl font-bold text-primary outline-none',
			'border-b-2 border-dashed border-primary/35 hover:border-primary/60 hover:bg-primary/5',
			'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100'
		)}
	>
		<span class="truncate">{triggerLabel}</span>
		<AbstractIcon
			name={icons.ChevronDown.name}
			class="size-5 shrink-0 text-primary/70"
			width="20"
			height="20"
			focusable="false"
		/>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start" sideOffset={8} class="min-w-[14rem] max-w-[20rem]">
		<DropdownMenu.Label class="text-xs text-base-content/60">Your workspaces</DropdownMenu.Label>
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
		modalDescription={`You are about to open "${switchWorkspaceModalData.workspaceName}". Billing and plan limits will reflect that workspace.`}
		modalVerficationWithAnswer={false}
	/>
{/if}
