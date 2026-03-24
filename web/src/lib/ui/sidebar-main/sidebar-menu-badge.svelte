<script lang="ts">
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
	bind:this={ref}
	data-slot="sidebar-menu-badge"
	data-sidebar="menu-badge"
	class={cn(
		"flex h-5 min-w-5 items-center justify-center rounded-md bg-base-content/10 px-1.5 text-xs font-medium text-base-content",
		"group-data-[collapsible=icon]:hidden",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>
