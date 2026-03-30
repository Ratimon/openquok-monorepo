<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		children
	}: {
		label: string;
		children: Snippet;
	} = $props();

	/** Must match DocsTabs.svelte `tabId()` for aria wiring. */
	function tabId(l: string) {
		return l.toLowerCase().replace(/\s+/g, '-');
	}
</script>

<!--
  Panel visibility is toggled by DocsTabs via [data-docs-tab-panel] (see DocsTabs.svelte).
  Do not use Tabs.Content here — MDsveX + context breaks tab switching for doc examples.
-->
<div
	data-docs-tab-panel={label}
	role="tabpanel"
	aria-labelledby="{tabId(label)}-tab"
	id="{tabId(label)}-panel"
	class="mt-4 [&>pre]:mt-2 hidden"
>
	{@render children()}
</div>
