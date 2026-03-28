<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...props
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="input-group"
	role="group"
	class={cn(
		"group/input-group relative flex w-full min-w-0 items-center overflow-hidden rounded-md border border-base-300 bg-base-100 shadow-xs outline-none",
		"focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
		"has-[>textarea]:h-auto",
		className
	)}
	{...props}
>
	{@render children?.()}
</div>
