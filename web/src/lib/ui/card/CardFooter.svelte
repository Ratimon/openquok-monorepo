<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from '$lib/ui/helpers/common';
	import { cn } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const baseStyles = 'flex items-center px-6 pt-6 border-t border-base-300';
	let resolvedClass = $derived(typeof className === 'string' ? className : '');
</script>

<div
	bind:this={ref}
	data-slot="card-footer"
	class={cn(baseStyles, resolvedClass)}
	{...restProps}
>
	{@render children?.()}
</div>
