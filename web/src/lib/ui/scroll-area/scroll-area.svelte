<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		class?: string;
		/** Classes for the scrollable viewport (inner element). */
		viewportClass?: string;
		/** Parity with common scroll-area APIs; scrolling is vertical-only for now. */
		orientation?: 'vertical' | 'horizontal' | 'both';
		children: Snippet;
	};

	let {
		class: className,
		viewportClass,
		orientation = 'vertical',
		children
	}: Props = $props();
</script>

<!--
  Scroll container: outer clips; inner scrolls (shadcn-style scroll-area pattern).
  bits-ui ScrollArea is not used here — native overflow + thin scrollbar for fewer deps.
-->
<div
	data-slot="scroll-area"
	data-orientation={orientation}
	class={cn('relative min-h-0 overflow-hidden', className)}
>
	<div
		data-slot="scroll-area-viewport"
		class={cn(
			'scroll-area-viewport h-full max-h-full min-h-0 w-full overflow-x-hidden overflow-y-auto',
			viewportClass
		)}
	>
		{@render children()}
	</div>
</div>

<style>
	.scroll-area-viewport {
		scrollbar-width: thin;
	}
</style>
