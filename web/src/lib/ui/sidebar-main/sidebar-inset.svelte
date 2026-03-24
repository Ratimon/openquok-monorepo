<script lang="ts">
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="sidebar-inset"
	data-sidebar="inset"
	class={cn("flex flex-1 flex-col gap-2 px-2", className)}
	{...restProps}
>
	{@render children?.()}
</div>
