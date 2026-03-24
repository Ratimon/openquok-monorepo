<script lang="ts">
	import type { WithoutChild } from 'bits-ui';
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChild<SelectPrimitive.ScrollDownButtonProps> = $props();
</script>

<SelectPrimitive.ScrollDownButton
	bind:ref
	data-slot="select-scroll-down-button"
	class={cn('flex cursor-default items-center justify-center py-1', className)}
	{...restProps}
>
	<AbstractIcon name={icons.ChevronDown.name} width="4" height="4" focusable="false" />
</SelectPrimitive.ScrollDownButton>
