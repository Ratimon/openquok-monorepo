<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/ui/helpers/common';

	import * as ButtonGroup from '$lib/ui/button-group';

	import { getMessageBranchContext } from '../context/message-context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();

	const branchContext = getMessageBranchContext();

	let shouldRender = $derived(branchContext.totalBranches > 1);
</script>

{#if shouldRender}
	<div {...restProps}>
		<ButtonGroup.Root
			class={cn(
				'[&>*:not(:first-child)]:rounded-l-md [&>*:not(:last-child)]:rounded-r-md',
				className
			)}
		>
			{@render children?.()}
		</ButtonGroup.Root>
	</div>
{/if}
