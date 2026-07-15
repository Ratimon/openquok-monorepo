<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	export interface ConversationContentProps extends WithElementRef<
		HTMLAttributes<HTMLDivElement>
	> {
		children?: Snippet;
	}
</script>

<script lang="ts">
	import { watch } from 'runed';

	import { getStickToBottomContext } from './stick-to-bottom-context.svelte.js';

	let {
		class: className,
		children,
		ref = $bindable(null),
		...restProps
	}: ConversationContentProps = $props();

	const context = getStickToBottomContext();

	watch(
		() => ref,
		() => {
			if (ref) {
				context.setElement(ref);
				context.scrollToBottom('smooth');
			}
		}
	);
</script>

<div bind:this={ref} class={cn('flex flex-col gap-8 p-4', className)} {...restProps}>
	{@render children?.()}
</div>
