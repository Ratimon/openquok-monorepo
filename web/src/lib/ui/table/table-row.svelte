<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		'data-slot': dataSlot = 'table-row',
		children,
		...restProps
	}: WithElementRef<
		HTMLAttributes<HTMLTableRowElement> & { 'data-slot'?: string },
		HTMLTableRowElement
	> = $props();
</script>

<tr
	bind:this={ref}
	data-slot={dataSlot}
	class={cn('border-base-300 border-b transition-colors hover:bg-base-200/50', className)}
	{...restProps}
>
	{@render children?.()}
</tr>
