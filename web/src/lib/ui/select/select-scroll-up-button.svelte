<script lang="ts">
	import type { WithoutChild } from 'bits-ui';
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChild<SelectPrimitive.ScrollUpButtonProps> = $props();
</script>

<SelectPrimitive.ScrollUpButton
	bind:ref
	data-slot="select-scroll-up-button"
	class={cn('flex cursor-default items-center justify-center py-1', className)}
	{...restProps}
>
	<AbstractIcon name={icons.ChevronUp.name} width="4" height="4" focusable="false" />
</SelectPrimitive.ScrollUpButton>
