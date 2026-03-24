<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
	};

	let { children }: Props = $props();
</script>

<!-- Same narrow width as desktop collapsed (icons only, no labels) -->
<div
	class="md:hidden flex flex-col h-full px-4 py-4 bg-base-200 flex-shrink-0 w-[60px] overflow-x-hidden overflow-y-auto"
	role="complementary"
	aria-label="Sidebar"
>
	{@render children?.()}
</div>
