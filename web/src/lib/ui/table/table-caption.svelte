<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		'data-slot': dataSlot = 'table-caption',
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement> & { 'data-slot'?: string }, HTMLTableCaptionElement> =
		$props();
</script>

<caption bind:this={ref} data-slot={dataSlot} class={cn('text-base-content/60 mt-4 text-sm', className)} {...restProps}>
	{@render children?.()}
</caption>
