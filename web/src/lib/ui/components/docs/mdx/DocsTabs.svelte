<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as TabsUI from '$lib/ui/tabs/index.js';

	let {
		items,
		children
	}: {
		items: string[];
		children: Snippet;
	} = $props();
</script>

<div class="not-prose my-6">
	<TabsUI.Root defaultValue={items[0]}>
		<TabsUI.List class="tabs tabs-boxed w-full flex-wrap justify-start">
			{#each items as item (item)}
				<TabsUI.Trigger value={item}>{item}</TabsUI.Trigger>
			{/each}
		</TabsUI.List>
		{@render children()}
	</TabsUI.Root>
</div>
