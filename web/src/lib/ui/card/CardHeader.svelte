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

	const baseStyles = 'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6';
	let resolvedClass = $derived(typeof className === 'string' ? className : '');
</script>

<div
	bind:this={ref}
	data-slot="card-header"
	class={cn(baseStyles, resolvedClass)}
	{...restProps}
>
	{@render children?.()}
</div>
