<script lang="ts">
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		children,
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLLIElement>> = $props();
</script>

<li
	bind:this={ref}
	data-slot="sidebar-menu-sub-item"
	data-sidebar="menu-sub-item"
	role="listitem"
	class={cn("group/menu-sub-item", className)}
	{...restProps}
>
	{@render children?.()}
</li>
