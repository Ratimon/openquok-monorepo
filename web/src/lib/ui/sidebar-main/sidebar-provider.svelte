<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import {
		SIDEBAR_COOKIE_MAX_AGE,
		SIDEBAR_COOKIE_NAME,
		SIDEBAR_WIDTH,
		SIDEBAR_WIDTH_ICON,
	} from "./constants";
	import { setSidebar } from "$lib/ui/sidebar-main/context.svelte";

	let {
		ref = $bindable(null),
		open = $bindable(true),
		onOpenChange = () => {},
		class: className,
		style,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	} = $props();

	const sidebar = setSidebar({
		open: () => open,
		setOpen: (value: boolean) => {
			open = value;
			onOpenChange(value);
			if (typeof document !== "undefined") {
				document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
			}
		},
	});
</script>

<svelte:window onkeydown={sidebar.handleShortcutKeydown} />

<div
	bind:this={ref}
	data-slot="sidebar-provider"
	data-sidebar="provider"
	class={cn("relative flex w-full flex-1 flex-col", className)}
	style="--sidebar-width: {SIDEBAR_WIDTH}; --sidebar-width-icon: {SIDEBAR_WIDTH_ICON}; {typeof style === 'string' ? style : ''}"
	{...restProps}
>
	{@render children?.()}
</div>
