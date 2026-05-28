<script lang="ts">
	import type { HTMLTdAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		'data-slot': dataSlot = 'table-cell',
		children,
		...restProps
	}: WithElementRef<HTMLTdAttributes & { 'data-slot'?: string }, HTMLTableCellElement> = $props();
</script>

<td bind:this={ref} data-slot={dataSlot} class={cn('text-base-content p-2 align-middle', className)} {...restProps}>
	{@render children?.()}
</td>
