<script lang="ts">
	import { cn, type WithElementRef } from '$lib/ui/helpers/common';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = WithElementRef<HTMLInputAttributes>;

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		class: className,
		'data-slot': dataSlot = 'switch',
		...restProps
	}: Props = $props();
</script>

<input
	bind:this={ref}
	data-slot={dataSlot}
	class={cn('toggle toggle-primary', className)}
	type="checkbox"
	checked={checked}
	{...restProps}
/>

