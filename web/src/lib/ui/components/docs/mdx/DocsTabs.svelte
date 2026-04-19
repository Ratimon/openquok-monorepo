<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		items,
		children
	}: {
		items: string[];
		children: Snippet;
	} = $props();

	/** Safe HTML id segment from tab label (labels may contain spaces). */
	function tabId(label: string) {
		return label.toLowerCase().replace(/\s+/g, '-');
	}

	let tabValue = $state('');
	let panelsEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		const first = items[0] ?? '';
		if (!items.length) return;
		if (tabValue === '' || !items.includes(tabValue)) tabValue = first;
	});

	/** Imperative show/hide — same idea as DocsCodeGroup; avoids Tabs context + Tabs.Content with MDsveX. */
	$effect(() => {
		if (!panelsEl) return;
		const v = tabValue;
		for (const el of panelsEl.querySelectorAll<HTMLElement>('[data-docs-tab-panel]')) {
			const label = el.dataset.docsTabPanel ?? '';
			el.classList.toggle('hidden', label !== v);
		}
	});
</script>

<div class="not-prose my-6">
	<div
		role="tablist"
		class="docs-tabs-switcher inline-flex max-w-full flex-wrap gap-1 rounded-xl border-2 border-base-300 bg-base-200/60 p-1 shadow-sm"
	>
		{#each items as item (item)}
			<button
				type="button"
				role="tab"
				class="min-w-0 flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 sm:flex-none md:min-w-[10rem] {tabValue === item
					? 'bg-primary text-primary-content shadow-md ring-2 ring-inset ring-primary-content/25'
					: 'bg-base-content/10 text-base-content/75 hover:bg-base-content/15 hover:text-base-content'}"
				aria-selected={tabValue === item}
				aria-controls="{tabId(item)}-panel"
				id="{tabId(item)}-tab"
				tabindex={tabValue === item ? 0 : -1}
				onclick={() => {
					tabValue = item;
				}}
			>
				{item}
			</button>
		{/each}
	</div>
	<div bind:this={panelsEl} class="tab-panels [&>div]:mt-0 [&>pre]:mt-2">
		{@render children()}
	</div>
</div>
