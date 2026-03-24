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

	const baseStyles = 'p-6 pt-0';
	let resolvedClass = $derived(typeof className === 'string' ? className : '');
</script>

<div
	bind:this={ref}
	data-slot="card-content"
	class={cn(baseStyles, resolvedClass)}
	{...restProps}
>
	{@render children?.()}
</div>
