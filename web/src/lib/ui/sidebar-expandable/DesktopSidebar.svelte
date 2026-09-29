<script lang="ts">
	import type { Snippet } from 'svelte';
	import { vopen } from '$lib/ui/sidebar-expandable/svelteContent';

	type Props = {
		className?: string;
		children?: Snippet;
	};

	let { className = '', children }: Props = $props();
</script>

<div
	role="complementary"
	aria-label="Sidebar"
	style="width: {$vopen ? '200px' : '60px'}; transition: width 0.4s;"
	class="sticky top-0 self-start h-svh min-h-0 px-4 py-4 hidden md:flex md:flex-col bg-base-200 flex-shrink-0 overflow-hidden {className}"
	onmouseenter={() => {
		vopen.set(true);
	}}
	onmouseleave={() => {
		vopen.set(false);
	}}
>
	{@render children?.()}
</div>
