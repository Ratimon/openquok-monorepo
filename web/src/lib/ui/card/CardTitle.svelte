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

	const baseStyles = 'font-semibold leading-none tracking-tight';
	let resolvedClass = $derived(typeof className === 'string' ? className : '');
</script>

<div
	bind:this={ref}
	data-slot="card-title"
	class={cn(baseStyles, resolvedClass)}
	{...restProps}
>
	{@render children?.()}
</div>
