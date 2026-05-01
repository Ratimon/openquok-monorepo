<script lang="ts">
	import { Pagination as PaginationPrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';
	import { buttonVariants } from '$lib/ui/buttons/Button.svelte';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: PaginationPrimitive.PrevButtonProps = $props();
</script>

<PaginationPrimitive.PrevButton
	bind:ref
	class={cn(buttonVariants({ variant: 'outline', size: 'icon' }), className)}
	{...restProps}
>
	<AbstractIcon name={icons.ChevronLeft.name} width="16" height="16" focusable="false" />
	<span class="sr-only">Previous</span>
</PaginationPrimitive.PrevButton>
