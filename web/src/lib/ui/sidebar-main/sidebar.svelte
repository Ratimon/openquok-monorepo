<script lang="ts">
	import { slide } from "svelte/transition";
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { HTMLAttributes } from "svelte/elements";
	import { SIDEBAR_WIDTH_MOBILE } from "$lib/ui/sidebar-main/constants";
	import { useSidebar } from "$lib/ui/sidebar-main/context.svelte";

	let {
		ref = $bindable(null),
		side = "left",
		variant = "sidebar",
		collapsible = "offcanvas",
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		side?: "left" | "right";
		variant?: "sidebar" | "floating" | "inset";
		collapsible?: "offcanvas" | "icon" | "none";
	} = $props();

	const sidebar = useSidebar();
</script>

{#if collapsible === "none"}
	<div
		bind:this={ref}
		data-slot="sidebar"
		data-sidebar={variant}
		data-collapsible={collapsible}
		class={cn("flex h-full w-[--sidebar-width] flex-col bg-base-200 text-base-content", className)}
		{...restProps}
	>
		{@render children?.()}
	</div>
{:else if sidebar.isMobile}
	<!-- Mobile: slide-over panel -->
	{#if sidebar.openMobile}
		<div
			class="fixed inset-0 z-50 bg-black/50"
			role="button"
			tabindex="-1"
			aria-label="Close sidebar"
			onclick={() => sidebar.setOpenMobile(false)}
			onkeydown={(e) => e.key === "Escape" && sidebar.setOpenMobile(false)}
		></div>
		<div
			in:slide={{ axis: "x", duration: 200 }}
			out:slide={{ axis: "x", duration: 200 }}
			class="fixed inset-y-0 start-0 z-50 flex h-full w-[var(--sidebar-width-mobile)] max-w-[85vw] flex-col bg-base-200 text-base-content shadow-lg"
			style="--sidebar-width-mobile: {SIDEBAR_WIDTH_MOBILE}"
			role="dialog"
			aria-label="Sidebar"
		>
			{@render children?.()}
		</div>
	{/if}
{:else}
	<div
		bind:this={ref}
		data-slot="sidebar"
		data-sidebar={variant}
		data-collapsible={collapsible}
		data-state={sidebar.state}
		class={cn("flex h-full flex-col bg-base-200 text-base-content", className)}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}
