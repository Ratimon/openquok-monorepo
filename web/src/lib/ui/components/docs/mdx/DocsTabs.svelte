<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		items,
		variant = 'pills',
		children
	}: {
		items: string[];
		/** `pills` is the boxed switcher for code samples. `line` is the underline row for prose. */
		variant?: 'pills' | 'line';
		children: Snippet;
	} = $props();

	let selected = $state<string | undefined>();
	let panelsEl: HTMLDivElement | undefined = $state();

	const isLine = $derived(variant === 'line');
	const tabValue = $derived(
		selected != null && items.includes(selected) ? selected : (items[0] ?? '')
	);

	$effect(() => {
		if (!panelsEl) return;
		const panels = panelsEl.querySelectorAll<HTMLElement>('[data-docs-tab-panel]');
		panels.forEach((panel) => {
			panel.classList.toggle('hidden', panel.dataset.docsTabPanel !== tabValue);
		});
	});

	function triggerClass(item: string) {
		if (isLine) {
			return tabValue === item
				? '-mb-px border-b-2 border-primary px-0.5 pb-2.5 text-sm font-medium text-primary'
				: '-mb-px border-b-2 border-transparent px-0.5 pb-2.5 text-sm font-medium text-base-content/60 hover:text-base-content';
		}
		return tabValue === item
			? 'rounded-md bg-base-100 px-3 py-1.5 text-sm font-medium text-base-content shadow-sm'
			: 'rounded-md px-3 py-1.5 text-sm font-medium text-base-content/60 hover:text-base-content';
	}
</script>

<div class="docs-tabs my-6">
	<div
		class={isLine
			? 'not-prose flex w-full gap-6 border-b border-base-content/15'
			: 'not-prose mb-0 flex w-fit gap-1 rounded-lg bg-base-200/80 p-1'}
		role="tablist"
	>
		{#each items as item (item)}
			<button
				type="button"
				class="transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary {triggerClass(
					item
				)}"
				role="tab"
				aria-selected={tabValue === item}
				onclick={() => (selected = item)}
			>
				{item}
			</button>
		{/each}
	</div>
	<div bind:this={panelsEl}>
		{@render children()}
	</div>
</div>
