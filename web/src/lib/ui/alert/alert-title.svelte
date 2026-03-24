<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/ui/helpers/common";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLHeadingElement>> = $props();

	const baseStyles = "font-semibold leading-none tracking-tight";
</script>

<h5
	bind:this={ref}
	data-slot="alert-title"
	class={cn(baseStyles, className)}
	{...restProps}
>
	{@render children?.()}
</h5>

