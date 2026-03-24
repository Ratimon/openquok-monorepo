<script lang="ts">
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLUListElement>> = $props();
</script>

<ul
	bind:this={ref}
	data-slot="sidebar-menu"
	data-sidebar="menu"
	role="list"
	class={cn("flex w-full min-w-0 flex-col gap-1", className)}
	{...restProps}
>
	{@render children?.()}
</ul>
