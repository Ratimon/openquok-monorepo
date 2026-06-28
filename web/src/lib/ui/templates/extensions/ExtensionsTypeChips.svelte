<script lang="ts">
	import type { ExtensionTypeFilter } from '$lib/listings/index';

	import { cn } from '$lib/ui/helpers/common';

	type Chip = { id: ExtensionTypeFilter; label: string };

	type Props = {
		activeType: ExtensionTypeFilter;
		onSelect?: (type: ExtensionTypeFilter) => void;
		class?: string;
	};

	let { activeType, onSelect, class: className = '' }: Props = $props();

	const chips: Chip[] = [
		{ id: 'all', label: 'All' },
		{ id: 'official', label: 'Official' },
		{ id: 'skills', label: 'Skills' },
		{ id: 'mcp', label: 'MCP' },
		{ id: 'both', label: 'Both' }
	];
</script>

<div class={cn('flex flex-wrap gap-2', className)} role="group" aria-label="Filter by extension type">
	{#each chips as chip (chip.id)}
		<button
			type="button"
			class={cn(
				'btn btn-sm rounded-full',
				activeType === chip.id ? 'btn-primary' : 'btn-ghost border border-base-content/10'
			)}
			aria-pressed={activeType === chip.id}
			onclick={() => onSelect?.(chip.id)}
		>
			{chip.label}
		</button>
	{/each}
</div>
