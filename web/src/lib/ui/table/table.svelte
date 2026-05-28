<script lang="ts">
	import type { HTMLTableAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		containerClass: containerClassName,
		'data-slot': dataSlot = 'table',
		children,
		...restProps
	}: WithElementRef<
		HTMLTableAttributes & {
			containerClass?: string;
			'data-slot'?: string;
		},
		HTMLTableElement
	> = $props();
</script>

<div data-slot="table-container" class={cn('w-full min-w-0 overflow-x-auto', containerClassName)}>
	<table bind:this={ref} data-slot={dataSlot} class={cn('table w-full text-base-content', className)} {...restProps}>
		{@render children?.()}
	</table>
</div>
