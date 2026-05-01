<script lang="ts">
	import type { WithoutChild } from 'bits-ui';
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	let {
		ref = $bindable(null),
		class: className,
		children,
		size = 'default',
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> & {
		size?: 'sm' | 'default';
	} = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	data-size={size}
	class={cn(
		'border-input bg-base-100 hover:bg-base-200 shadow-xs flex w-fit select-none items-center justify-between gap-2 whitespace-nowrap rounded-md border px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-primary [&_svg:not([class*="text-"])]:text-primary data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<AbstractIcon
		class="opacity-50"
		name={icons.ChevronDown.name}
		width="4"
		height="4"
		focusable="false"
	/>
</SelectPrimitive.Trigger>
