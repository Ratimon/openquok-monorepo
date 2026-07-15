<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/ui/helpers/common';

	import { ScrollArea } from '$lib/ui/scroll-area';

	interface Props {
		children?: Snippet;
		class?: string;
		orientation?: 'vertical' | 'horizontal' | 'both';
		/** Accepted for API parity; local ScrollArea has no scrollbar class slots. */
		scrollbarXClasses?: string;
		/** Accepted for API parity; local ScrollArea has no scrollbar class slots. */
		scrollbarYClasses?: string;
	}

	let {
		children,
		class: className,
		orientation = 'horizontal',
		scrollbarXClasses: _scrollbarXClasses,
		scrollbarYClasses: _scrollbarYClasses,
		...restProps
	}: Props = $props();

	let viewportClass = $derived(
		orientation === 'horizontal' || orientation === 'both'
			? 'overflow-x-auto overflow-y-hidden'
			: undefined
	);
</script>

<ScrollArea {orientation} {viewportClass} class="w-full whitespace-nowrap" {...restProps}>
	<div class={cn('flex w-max flex-nowrap items-center gap-2', className)}>
		{@render children?.()}
	</div>
</ScrollArea>
