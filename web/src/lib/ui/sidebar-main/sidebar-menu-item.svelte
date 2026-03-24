<script lang="ts">
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLLIElement>> = $props();
</script>

<li
	bind:this={ref}
	data-slot="sidebar-menu-item"
	data-sidebar="menu-item"
	role="listitem"
	class={cn("group/menu-item relative", className)}
	{...restProps}
>
	{@render children?.()}
</li>
