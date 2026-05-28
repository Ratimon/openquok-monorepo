<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		'data-slot': dataSlot = 'table-header',
		children,
		...restProps
	}: WithElementRef<
		HTMLAttributes<HTMLTableSectionElement> & { 'data-slot'?: string },
		HTMLTableSectionElement
	> = $props();
</script>

<thead bind:this={ref} data-slot={dataSlot} class={cn('[&_tr]:border-b [&_tr]:border-base-300', className)} {...restProps}>
	{@render children?.()}
</thead>
