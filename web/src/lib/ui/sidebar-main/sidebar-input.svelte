<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		value = $bindable(""),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLInputElement>> & { value?: string } = $props();
</script>

<input
	bind:this={ref}
	bind:value
	type="search"
	data-slot="sidebar-input"
	data-sidebar="input"
	class={cn(
		"h-8 w-full shrink-0 rounded-md bg-base-content/10 px-2 text-sm outline-hidden placeholder:text-base-content/50 focus-visible:ring-2 focus-visible:ring-primary",
		className
	)}
	{...restProps}
/>
