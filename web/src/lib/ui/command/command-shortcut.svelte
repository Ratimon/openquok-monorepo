<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
	bind:this={ref}
	data-slot="command-shortcut"
	class={cn(
		"ms-auto text-xs tracking-widest text-base-content/50 group-data-[selected]/command-item:text-base-content/70",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>
