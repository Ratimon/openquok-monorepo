<script lang="ts">
	import { cn, type WithElementRef } from '$lib/ui/helpers/common';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLHeadingElement>> = $props();
</script>

<h3
	bind:this={ref}
	data-slot="field-title"
	class={cn('text-sm font-semibold text-base-content', className)}
	{...restProps}
>
	{@render children?.()}
</h3>

