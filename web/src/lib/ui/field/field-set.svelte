<script lang="ts">
	import { cn, type WithElementRef } from '$lib/ui/helpers/common';
	import type { HTMLFieldsetAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLFieldsetAttributes> = $props();
</script>

<fieldset
	bind:this={ref}
	data-slot="field-set"
	class={cn('space-y-4', className)}
	{...restProps}
>
	{@render children?.()}
</fieldset>

