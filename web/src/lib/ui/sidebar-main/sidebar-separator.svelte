<script lang="ts">
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLHRElement>> = $props();
</script>

<hr
	bind:this={ref}
	data-slot="sidebar-separator"
	data-sidebar="separator"
	class={cn("bg-base-300 mx-2 w-auto shrink-0", className)}
	{...restProps}
/>
