<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		'data-slot': dataSlot = 'table-footer',
		children,
		...restProps
	}: WithElementRef<
		HTMLAttributes<HTMLTableSectionElement> & { 'data-slot'?: string },
		HTMLTableSectionElement
	> = $props();
</script>

<tfoot
	bind:this={ref}
	data-slot={dataSlot}
	class={cn('bg-base-200/50 border-t border-base-300 font-medium [&>tr]:last:border-b-0', className)}
	{...restProps}
>
	{@render children?.()}
</tfoot>
