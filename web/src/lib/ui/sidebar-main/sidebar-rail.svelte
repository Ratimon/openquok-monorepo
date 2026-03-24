<script lang="ts">
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { HTMLAttributes } from "svelte/elements";
	import { useSidebar } from "$lib/ui/sidebar-main/context.svelte";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLButtonElement>> = $props();

	const sidebar = useSidebar();
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="sidebar-rail"
	data-sidebar="rail"
	aria-label="Toggle Sidebar"
	class={cn(
		"absolute start-full top-6 z-50 flex size-6 items-center justify-center rounded-full border border-base-300 bg-base-200 text-base-content shadow-sm outline-hidden transition-transform hover:bg-base-content/10 hover:text-base-content focus-visible:ring-2 focus-visible:ring-primary",
		sidebar.open ? "translate-x-[-12px]" : "translate-x-[-12px] rotate-180",
		className
	)}
	onclick={() => sidebar.toggle()}
	{...restProps}
>
	{@render children?.()}
</button>
