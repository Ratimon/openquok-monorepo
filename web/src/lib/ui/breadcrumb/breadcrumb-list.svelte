<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLUListElement>> = $props();
</script>

<ul
	bind:this={ref}
	data-slot="breadcrumb-list"
	class={cn(className)}
	{...restProps}
>
	{@render children?.()}
</ul>
