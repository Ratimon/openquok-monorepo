<script lang="ts">
	import type { AccountExploreListingKindFilter } from '$lib/area-protected/ProtectedAccountExtensionsPage.presenter.svelte';

	import { cn } from '$lib/ui/helpers/common';

	type Chip = { id: AccountExploreListingKindFilter; label: string };

	type Props = {
		activeKind: AccountExploreListingKindFilter;
		onSelect?: (kind: AccountExploreListingKindFilter) => void;
		class?: string;
	};

	let { activeKind, onSelect, class: className = '' }: Props = $props();

	const chips: Chip[] = [
		{ id: 'all', label: 'All' },
		{ id: 'extension', label: 'Extensions' },
		{ id: 'stack', label: 'Stacks' }
	];
</script>

<div class={cn('flex flex-wrap gap-2', className)} role="group" aria-label="Filter by listing kind">
	{#each chips as chip (chip.id)}
		<button
			type="button"
			class={cn(
				'btn btn-sm rounded-full',
				activeKind === chip.id ? 'btn-primary' : 'btn-ghost border border-base-content/10'
			)}
			aria-pressed={activeKind === chip.id}
			onclick={() => onSelect?.(chip.id)}
		>
			{chip.label}
		</button>
	{/each}
</div>
