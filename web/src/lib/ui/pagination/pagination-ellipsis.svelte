<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
	bind:this={ref}
	class={cn('flex size-9 items-center justify-center', className)}
	aria-hidden="true"
	{...restProps}
>
	…
</span>
