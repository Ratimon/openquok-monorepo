<script lang="ts">
	import { Collapsible as CollapsiblePrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		open = $bindable(false),
		class: className,
		children,
		...restProps
	}: CollapsiblePrimitive.RootProps = $props();
</script>

<CollapsiblePrimitive.Root
	bind:ref
	bind:open
	data-slot="accordion-item"
	class={cn('w-full', className)}
	{...restProps}
>
	{@render children?.()}
</CollapsiblePrimitive.Root>

