<script lang="ts">
	import { toc } from '$lib/docs/utils/toc-state.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	let open = $state(false);

	function handleClick(id: string) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
			toc.activeId = id;
			open = false;
		}
	}
</script>

{#if toc.items.length > 0}
	<div class="border-base-300 bg-base-200/50 mb-6 rounded-lg border lg:hidden">
		<button
			type="button"
			onclick={() => (open = !open)}
			class="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium"
		>
			<AbstractIcon name="List" class="size-4" width="16" height="16" />
			<span>On this page</span>
			<AbstractIcon
				name="ChevronDown"
				class="ml-auto size-4 transition-transform {open ? 'rotate-180' : ''}"
				width="16"
				height="16"
			/>
		</button>
		{#if open}
			<nav class="border-base-300 border-t px-4 py-3">
				<ul class="space-y-1 text-sm">
					{#each toc.items as item (item.id)}
						<li style:padding-left="{(item.depth - 2) * 12}px">
							<button
								type="button"
								onclick={() => handleClick(item.id)}
								class="hover:text-base-content w-full py-1 text-left transition-colors {toc.activeId === item.id
									? 'text-base-content font-medium'
									: 'text-base-content/70'}"
							>
								{item.text}
							</button>
						</li>
					{/each}
				</ul>
			</nav>
		{/if}
	</div>
{/if}
