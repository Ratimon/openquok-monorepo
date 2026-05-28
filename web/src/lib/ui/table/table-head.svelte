<script lang="ts">
	import type { HTMLThAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		'data-slot': dataSlot = 'table-head',
		children,
		...restProps
	}: WithElementRef<HTMLThAttributes & { 'data-slot'?: string }, HTMLTableCellElement> = $props();
</script>

<th
	bind:this={ref}
	data-slot={dataSlot}
	class={cn('text-base-content h-10 px-2 text-left align-middle font-medium whitespace-nowrap', className)}
	{...restProps}
>
	{@render children?.()}
</th>
