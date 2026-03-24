<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="select-separator"
	role="separator"
	class={cn('bg-base-300 pointer-events-none -mx-1 my-1 h-px shrink-0', className)}
	{...restProps}
></div>
