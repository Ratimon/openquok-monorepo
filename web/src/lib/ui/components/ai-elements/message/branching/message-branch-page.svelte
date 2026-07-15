<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/ui/helpers/common';

	import { getMessageBranchContext } from '../context/message-context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();

	const branchContext = getMessageBranchContext();
</script>

<div
	class={cn(
		'text-muted-foreground flex items-center border-none bg-transparent px-2 text-xs shadow-none',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{branchContext.currentBranch + 1} of {branchContext.totalBranches}
	{/if}
</div>
