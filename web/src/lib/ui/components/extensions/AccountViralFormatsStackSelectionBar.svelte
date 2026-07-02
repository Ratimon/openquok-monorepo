<script lang="ts">
	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		selectedCount?: number;
		onCreateStack?: () => void;
		onClearSelection?: () => void;
		class?: string;
	};

	let {
		selectedCount = 0,
		onCreateStack,
		onClearSelection,
		class: className = ''
	}: Props = $props();

	const hasSelection = $derived(selectedCount > 0);
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
					{selectedCount} building block{selectedCount === 1 ? '' : 's'} selected for a new playbook
				</p>
				<p class="mt-0.5 text-xs text-base-content/65">
					Review your picks, then open the playbook editor to name it and choose which building blocks
					to include.
				</p>
			{:else}
				<p class="text-sm font-semibold text-base-content">Compose a playbook from building blocks</p>
				<p class="mt-0.5 text-xs text-base-content/65">
					Use the <span class="font-medium text-base-content/80">Add</span> checkboxes on building block
					cards below, then create your playbook here.
				</p>
			{/if}
		</div>
	</div>

	<div class="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
		{#if hasSelection}
			<Button variant="primary" size="sm" onclick={() => onCreateStack?.()}>
				Create playbook ({selectedCount})
			</Button>
			<Button variant="ghost" size="sm" onclick={() => onClearSelection?.()}>
				Clear selection
			</Button>
		{:else}
			<Button variant="outline" size="sm" disabled class="pointer-events-none opacity-60">
				Create playbook
			</Button>
		{/if}
	</div>
</div>
