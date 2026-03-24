<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/ui/helpers/common";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const baseStyles = "text-sm text-base-content/80";
</script>

<div
	bind:this={ref}
	data-slot="alert-description"
	class={cn(baseStyles, className)}
	{...restProps}
>
	{@render children?.()}
</div>

