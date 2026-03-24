<script lang="ts">
	import { cn, type WithElementRef } from '$lib/ui/helpers/common';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLParagraphElement>> = $props();
</script>

<p
	bind:this={ref}
	data-slot="field-description"
	class={cn('text-[0.8rem] text-base-content/70', className)}
	{...restProps}
>
	{@render children?.()}
</p>

