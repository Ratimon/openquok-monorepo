<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="sidebar-group"
	data-sidebar="group"
	class={cn("group flex w-full min-w-0 flex-col", className)}
	role="group"
	{...restProps}
>
	{@render children?.()}
</div>
