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
	data-slot="breadcrumb-page"
	aria-current="page"
	class={cn("inline-flex items-center gap-2 font-normal text-base-content", className)}
	{...restProps}
>
	{@render children?.()}
</span>
