<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Pagination as PaginationPrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';
	import { buttonVariants } from '$lib/ui/buttons/Button.svelte';

	let {
		ref = $bindable(null),
		class: className,
		isActive,
		page,
		children: linkChildren,
		...restProps
	}: PaginationPrimitive.PageProps & {
		isActive?: boolean;
		children?: Snippet;
	} = $props();
</script>

<PaginationPrimitive.Page
	bind:ref
	class={cn(
		buttonVariants({
			variant: isActive ? 'primary' : 'outline',
			size: 'icon'
		}),
		className
	)}
	{page}
	{...restProps}
>
	{#snippet children()}
		{#if linkChildren}
			{@render linkChildren()}
		{:else}
			{page.value}
		{/if}
	{/snippet}
</PaginationPrimitive.Page>
