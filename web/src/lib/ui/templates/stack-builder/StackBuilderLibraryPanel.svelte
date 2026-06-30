<script lang="ts">
	import type { StackBuilderLibraryItem } from '$lib/stack-builder/stackBuilder.types';

	type Props = {
		items: StackBuilderLibraryItem[];
		onAddItem: (item: StackBuilderLibraryItem) => void;
	};

	let { items, onAddItem }: Props = $props();

	function kindLabel(kind: StackBuilderLibraryItem['kind']): string {
		return kind === 'cli' ? 'CLI' : 'MCP';
	}
</script>

<div class="flex h-full min-h-0 flex-col">
	<header class="border-b border-base-content/10 px-4 py-3">
		<h2 class="text-sm font-semibold text-base-content">Library</h2>
		<p class="mt-1 text-xs text-base-content/60">Click a command or tool to add it to the workflow.</p>
	</header>

	<div class="min-h-0 flex-1 overflow-y-auto p-3">
		{#if items.length === 0}
			<p class="rounded-lg border border-dashed border-base-content/15 p-4 text-sm text-base-content/60">
				Select at least one extension to populate the library.
			</p>
		{:else}
			<ul class="space-y-2">
				{#each items as item (item.id)}
					<li>
						<button
							type="button"
							class="w-full rounded-xl border border-base-content/10 bg-base-100 p-3 text-left transition hover:border-primary/40 hover:bg-base-200/40"
							onclick={() => onAddItem(item)}
						>
							<div class="flex flex-wrap items-center gap-2">
								<span class="badge badge-outline badge-xs">{kindLabel(item.kind)}</span>
								<span class="badge badge-ghost badge-xs">{item.listingSlug}</span>
							</div>
							<p class="mt-2 font-mono text-sm font-semibold text-base-content">{item.name}</p>
							<p class="mt-1 line-clamp-2 text-xs text-base-content/70">{item.description}</p>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
