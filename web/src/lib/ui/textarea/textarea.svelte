<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from '$lib/ui/helpers/common';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	type Props = WithElementRef<WithoutChildren<HTMLTextareaAttributes>>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		'data-slot': dataSlot = 'textarea',
		...restProps
	}: Props = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(
		'textarea textarea-bordered w-full bg-base-100 text-base-content',
		'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
		className
	)}
	bind:value
	{...restProps}
></textarea>

