<script lang="ts">
	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		selectedCount?: number;
		primaryActionLabel?: string;
		idleTitle?: string;
		idleDescription?: string;
		selectedTitle?: string;
		selectedDescription?: string;
		onCreateStack?: () => void;
		onPrimaryAction?: () => void;
		onClearSelection?: () => void;
		class?: string;
	};

	let {
		selectedCount = 0,
		primaryActionLabel = 'Create playbook',
		idleTitle = 'Compose a playbook from building blocks',
		idleDescription = 'Use the Add checkboxes on building block cards below, then create your playbook here.',
		selectedTitle = 'building blocks selected for a new playbook',
		selectedDescription = 'Review your picks, then open the skill builder to edit your playbook markdown before saving the draft.',
		onCreateStack,
		onPrimaryAction,
		onClearSelection,
		class: className = ''
	}: Props = $props();

	const hasSelection = $derived(selectedCount > 0);
	const runPrimaryAction = $derived(onPrimaryAction ?? onCreateStack);
</script>

<div
	class={cn(
		'flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
		hasSelection
			? 'border-primary/40 bg-primary/10'
			: 'border-dashed border-primary/25 bg-base-200/40',
		className
	)}
	role="status"
	aria-live="polite"
>
	<div class="flex min-w-0 items-start gap-3">
		<div
			class={cn(
				'grid size-9 shrink-0 place-items-center rounded-lg',
				hasSelection ? 'bg-primary/15 text-primary' : 'bg-base-300/50 text-base-content/55'
			)}
			aria-hidden="true"
		>
			<AbstractIcon name={icons.Braces.name} class="size-4" width="16" height="16" />
		</div>
		<div class="min-w-0">
			{#if hasSelection}
				<p class="text-sm font-semibold text-base-content">
					{selectedCount} {selectedTitle}
				</p>
				<p class="mt-0.5 text-xs text-base-content/65">
					{selectedDescription}
				</p>
			{:else}
				<p class="text-sm font-semibold text-base-content">{idleTitle}</p>
				<p class="mt-0.5 text-xs text-base-content/65">
					{idleDescription}
				</p>
			{/if}
		</div>
	</div>

	<div class="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
		{#if hasSelection}
			<Button variant="primary" size="sm" onclick={() => runPrimaryAction?.()}>
				{primaryActionLabel} ({selectedCount})
			</Button>
			<Button variant="ghost" size="sm" onclick={() => onClearSelection?.()}>
				Clear selection
			</Button>
		{:else}
			<Button variant="outline" size="sm" disabled class="pointer-events-none opacity-60">
				{primaryActionLabel}
			</Button>
		{/if}
	</div>
</div>
