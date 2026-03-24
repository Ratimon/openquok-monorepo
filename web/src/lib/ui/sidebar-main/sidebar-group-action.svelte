<script lang="ts">
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		...restProps
	}: WithElementRef<HTMLButtonAttributes> & {
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const mergedProps = $derived({
		class: cn(
			"text-base-content ring-base-content/20 hover:bg-base-content/10 hover:text-base-content absolute end-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
			// Increases the hit area of the button on mobile.
			"after:absolute after:-inset-2 md:after:hidden",
			"group-data-[collapsible=icon]:hidden",
			className
		),
		"data-slot": "sidebar-group-action",
		"data-sidebar": "group-action",
		...restProps,
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<button bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</button>
{/if}