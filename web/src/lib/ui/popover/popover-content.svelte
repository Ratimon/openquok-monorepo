<script lang="ts">
	import type { Snippet } from "svelte";
	import { Popover as PopoverPrimitive } from "bits-ui";
	import PopoverPortal from "$lib/ui/popover/popover-portal.svelte";
	import { cn, type WithoutChildrenOrChild } from "$lib/ui/helpers/common";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		align = "center",
		children,
		portalProps,
		...restProps
	}: PopoverPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof PopoverPortal>>;
		children?: Snippet;
	} = $props();
</script>

<PopoverPortal {...portalProps}>
	<PopoverPrimitive.Content
		bind:ref
		{sideOffset}
		{align}
		class={cn(
			"z-50 w-72 rounded-md border border-base-300 bg-base-100 p-4 text-base-content shadow-md outline-none",
			"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
			className
		)}
		{...restProps}
	>
		{@render children?.()}
	</PopoverPrimitive.Content>
</PopoverPortal>
