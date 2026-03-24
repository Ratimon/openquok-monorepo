<script lang="ts">
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		showIcon = false,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		showIcon?: boolean;
	} = $props();

	const width = `${Math.floor(Math.random() * 40) + 50}%`;
</script>

<div
	bind:this={ref}
	data-slot="sidebar-menu-skeleton"
	data-sidebar="menu-skeleton"
	class={cn("flex h-8 gap-2 rounded-md px-2", className)}
	{...restProps}
>
	{#if showIcon}
		<div class="size-4 shrink-0 animate-pulse rounded-md bg-base-content/10"></div>
	{/if}
	<div
		class="h-4 shrink-0 animate-pulse rounded-md bg-base-content/10"
		style="width: {width}"
	></div>
	{@render children?.()}
</div>
