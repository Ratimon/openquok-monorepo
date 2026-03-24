<script lang="ts">
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		showOnHover = false,
		children,
		child,
		...restProps
	}: WithElementRef<HTMLButtonAttributes> & {
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		showOnHover?: boolean;
	} = $props();

	const mergedProps = $derived({
		class: cn(
			"text-base-content ring-base-content/20 hover:bg-base-content/10 hover:text-base-content peer-hover/menu-button:text-base-content absolute end-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
			"after:absolute after:-inset-2 md:after:hidden",
			"peer-data-[size=sm]/menu-button:top-1",
			"peer-data-[size=default]/menu-button:top-1.5",
			"peer-data-[size=lg]/menu-button:top-2.5",
			"group-data-[collapsible=icon]:hidden",
			showOnHover &&
				"peer-data-[active=true]/menu-button:text-base-content group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
			className
		),
		"data-slot": "sidebar-menu-action",
		"data-sidebar": "menu-action",
		...restProps,
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<button bind:this={ref} type="button" {...mergedProps}>
		{@render children?.()}
	</button>
{/if}
