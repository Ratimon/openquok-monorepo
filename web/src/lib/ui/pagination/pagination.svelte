<script lang="ts">
	import { Pagination as PaginationPrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		children,
		count = 0,
		perPage = 10,
		page = $bindable(1),
		onPageChange,
		siblingCount = 1,
		...restProps
	}: PaginationPrimitive.RootProps = $props();
</script>

{#if onPageChange != null}
	<PaginationPrimitive.Root
		bind:ref
		class={cn('flex flex-row items-center gap-2', className)}
		{count}
		{perPage}
		{page}
		{onPageChange}
		{siblingCount}
		{...restProps}
	>
		{#snippet child(data)}
			{@render children?.(data)}
		{/snippet}
	</PaginationPrimitive.Root>
{:else}
	<PaginationPrimitive.Root
		bind:ref
		class={cn('flex flex-row items-center gap-2', className)}
		{count}
		{perPage}
		bind:page
		{siblingCount}
		{...restProps}
	>
		{#snippet child(data)}
			{@render children?.(data)}
		{/snippet}
	</PaginationPrimitive.Root>
{/if}
