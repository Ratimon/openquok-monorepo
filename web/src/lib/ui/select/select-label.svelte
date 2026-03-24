<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="select-label"
	class={cn('text-base-content/70 px-2 py-1.5 text-xs font-medium', className)}
	{...restProps}
>
	{@render children?.()}
</div>
