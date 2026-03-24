<script lang="ts">
	import { cn, type WithElementRef } from '$lib/ui/helpers/common';
	import type { HTMLAttributes } from 'svelte/elements';

	type FieldOrientation = 'vertical' | 'horizontal';

	let {
		ref = $bindable(null),
		class: className,
		orientation = 'vertical',
		invalid = false,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		orientation?: FieldOrientation;
		invalid?: boolean;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="field"
	data-invalid={invalid ? 'true' : undefined}
	class={cn(
		'group/field data-[invalid=true]:text-error flex w-full gap-3',
		orientation === 'vertical' ? 'flex-col [&>*]:w-full' : 'flex-row items-start [&>[data-slot=field-label]]:flex-auto [&>[data-slot=field-content]]:flex-auto',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>

