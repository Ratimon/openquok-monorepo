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

	let el: HTMLDivElement | undefined = $state();
	let tabValue = $state('');

	$effect(() => {
		const first = items[0] ?? '';
		if (tabValue === '' || !items.includes(tabValue)) tabValue = first;
	});

	$effect(() => {
		if (!el || items.length === 0) return;
		const blocks = el.querySelectorAll<HTMLElement>(':scope > [data-code-tab]');
		blocks.forEach((block, i) => {
			block.style.display = i === 0 ? '' : 'none';
		});
	});

	function switchTab(label: string) {
		if (!el) return;
		const blocks = el.querySelectorAll<HTMLElement>(':scope > [data-code-tab]');
		blocks.forEach((block) => {
			block.style.display = block.dataset.codeTab === label ? '' : 'none';
		});
	}

	$effect(() => {
		switchTab(tabValue);
	});
</script>

<div class="not-prose my-6">
	<TabsUI.Root bind:value={tabValue}>
		<TabsUI.List class="tabs tabs-boxed w-full flex-wrap justify-start">
			{#each items as item (item)}
				<TabsUI.Trigger value={item}>{item}</TabsUI.Trigger>
			{/each}
		</TabsUI.List>
	</TabsUI.Root>
	<div
		bind:this={el}
		class="[&>div]:mt-0 [&_.shiki]:rounded-t-none [&_.code-block-titled]:mt-0 [&_.code-block-titled_.shiki]:rounded-t-none"
	>
		{@render children()}
	</div>
</div>
