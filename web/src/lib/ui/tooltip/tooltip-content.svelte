<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import TooltipPortal from '$lib/ui/tooltip/tooltip-portal.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import type { ComponentProps } from 'svelte';
	import type { WithoutChildrenOrChild } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		side = 'top',
		children,
		portalProps,
		...restProps
	}: TooltipPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof TooltipPortal>>;
		children?: Snippet;
	} = $props();
</script>

<TooltipPortal {...portalProps}>
	<TooltipPrimitive.Content
		bind:ref
		{sideOffset}
		{side}
		class={cn(
			'z-50 overflow-hidden rounded-md bg-base-100 px-3 py-1.5 text-xs text-base-content shadow-md border border-base-300',
			'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
	</TooltipPrimitive.Content>
</TooltipPortal>
