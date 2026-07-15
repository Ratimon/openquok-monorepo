<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	export interface ConversationProps extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
		children?: Snippet;
		initial?: ScrollBehavior;
		resize?: ScrollBehavior;
	}
	// indexing
</script>

<script lang="ts">
	import { setStickToBottomContext } from './stick-to-bottom-context.svelte.js';

	let {
		class: className,
		children,
		initial: _initial = 'smooth',
		resize: _resize = 'smooth',
		ref = $bindable(null),
		...restProps
	}: ConversationProps = $props();

	// Establishes stick-to-bottom context for ConversationContent / scroll button.
	setStickToBottomContext();
</script>

<div
	bind:this={ref}
	class={cn('relative flex h-full flex-col overflow-hidden', className)}
	role="log"
	{...restProps}
>
	{@render children?.()}
</div>
