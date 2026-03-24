<script lang="ts">
	import Button from "$lib/ui/buttons/Button.svelte";
	import { cn } from "$lib/ui/helpers/common";
	import AbstractIcon from "$lib/ui/icons/AbstractIcon.svelte";
	import { icons } from "$data/icon";
	import { useSidebar } from "$lib/ui/sidebar-main/context.svelte";

	let {
		ref = $bindable(null),
		class: className,
		onclick,
		...restProps
	}: {
		ref?: HTMLButtonElement | null;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		[key: string]: unknown;
	} = $props();

	const sidebar = useSidebar();
</script>

<Button
	bind:ref={ref}
	variant="ghost"
	size="icon"
	class={cn(className)}
	onclick={(e) => {
		onclick?.(e);
		sidebar.toggle();
	}}
	aria-label="Toggle Sidebar"
	{...restProps}
>
	<AbstractIcon name={icons.MenuLine.name} width="24" height="24" focusable="false" />
</Button>
