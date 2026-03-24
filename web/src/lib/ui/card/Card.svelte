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

	const baseStyles = 'bg-base-100 text-base-content flex flex-col gap-6 rounded-xl border py-6 shadow-sm border-base-300';
	let resolvedClass = $derived(typeof className === 'string' ? className : '');
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(baseStyles, resolvedClass)}
	{...restProps}
>
	{@render children?.()}
</div>
