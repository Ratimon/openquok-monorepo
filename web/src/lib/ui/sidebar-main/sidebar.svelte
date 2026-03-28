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
		class={cn(
			"flex h-full w-[var(--sidebar-width)] shrink-0 flex-col bg-base-200 text-base-content",
			className
		)}
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
	<!-- Desktop: gap + fixed panel; open state collapses off-canvas or icon width (matches shadcn-style sidebar) -->
	<div
		bind:this={ref}
		data-slot="sidebar"
		data-sidebar={variant}
		class={cn(
			"text-base-content group peer hidden self-stretch md:block",
			className
		)}
		data-state={sidebar.state}
		data-collapsible={sidebar.state === "collapsed" ? collapsible : ""}
		data-variant={variant}
		data-side={side}
		{...restProps}
	>
		<div
			data-slot="sidebar-gap"
			class={cn(
				"relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear",
				"group-data-[collapsible=offcanvas]:w-0",
				"group-data-[side=right]:rotate-180",
				variant === "floating" || variant === "inset"
					? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
					: "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]"
			)}
		></div>
		<div
			data-slot="sidebar-container"
			class={cn(
				"fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex",
				side === "left"
					? "start-0 group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)]"
					: "end-0 group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)]",
				variant === "floating" || variant === "inset"
					? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]"
					: cn(
							"group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]",
							"group-data-[side=left]:border-e group-data-[side=left]:border-base-300",
							"group-data-[side=right]:border-s group-data-[side=right]:border-base-300"
						)
			)}
		>
			<div
				data-sidebar="sidebar"
				data-slot="sidebar-inner"
				class={cn(
					"flex size-full flex-col bg-base-200 text-base-content",
					"group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-base-300"
				)}
			>
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
