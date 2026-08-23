<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		children
	}: {
		label: string;
		children: Snippet;
	} = $props();
</script>

<!--
  Visibility is toggled by DocsTabs via [data-docs-tab-panel] (see DocsTabs.svelte).
  Do not use Tabs.Content here — MDsveX + context breaks tab switching for doc examples.
  Nested `prose` restores body typography (the tablist stays `not-prose`).
  Use `[&_a]` for links — parent Steps is `not-prose`, so `prose-a:*` never applies.
-->
<div
	data-docs-tab-panel={label}
	role="tabpanel"
	class="docs-tab-panel prose mt-4 hidden max-w-none flex flex-col gap-4 text-base-content prose-p:m-0 prose-p:leading-relaxed prose-p:text-base-content/90 prose-strong:text-base-content prose-code:text-base-content [&>pre]:mt-2 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/50 [&_a]:underline-offset-[3px] hover:[&_a]:decoration-primary"
>
	{@render children()}
</div>
