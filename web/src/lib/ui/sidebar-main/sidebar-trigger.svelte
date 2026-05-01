<script lang="ts">
	import type { ComponentProps } from "svelte";

	import Button from "$lib/ui/buttons/Button.svelte";
	import { cn } from "$lib/ui/helpers/common";
	import AbstractIcon from "$lib/ui/icons/AbstractIcon.svelte";
	import { icons } from "$data/icons";
	import { useSidebar } from "$lib/ui/sidebar-main/context.svelte";

	let {
		ref = $bindable(null),
		class: className,
		onclick,
		...restProps
	}: Omit<ComponentProps<typeof Button>, "children"> & {
		onclick?: (e: MouseEvent) => void;
	} = $props();

	const sidebar = useSidebar();

	/** Override ghost `hover:bg-accent`; match docs header icon hit (theme / language / social). */
	const triggerHitClass = cn(
		'text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors outline-none',
		'inline-flex shrink-0 items-center justify-center'
	);

	function handleClick(e: MouseEvent) {
		onclick?.(e);
		sidebar.toggle();
	}
</script>

<Button
	bind:ref
	variant="ghost"
	size="icon"
	type="button"
	data-sidebar="trigger"
	data-slot="sidebar-trigger"
	class={cn(triggerHitClass, className)}
	{...restProps}
	onclick={handleClick}
>
	<AbstractIcon name={icons.PanelLeft.name} class="size-4" width="16" height="16" focusable="false" />
	<span class="sr-only">Toggle Sidebar</span>
</Button>
