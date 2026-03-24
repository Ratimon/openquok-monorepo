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
	data-slot="sidebar-menu-sub"
	data-sidebar="menu-sub"
	role="list"
	class={cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-s border-base-300", className)}
	{...restProps}
>
	{@render children?.()}
</ul>
