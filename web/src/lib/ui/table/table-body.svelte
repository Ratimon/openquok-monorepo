<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		'data-slot': dataSlot = 'table-body',
		children,
		...restProps
	}: WithElementRef<
		HTMLAttributes<HTMLTableSectionElement> & { 'data-slot'?: string },
		HTMLTableSectionElement
	> = $props();
</script>

<tbody bind:this={ref} data-slot={dataSlot} class={cn('[&_tr:last-child]:border-0', className)} {...restProps}>
	{@render children?.()}
</tbody>
