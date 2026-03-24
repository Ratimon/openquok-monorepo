<script lang="ts">
	import { tv, type VariantProps } from "tailwind-variants";
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { useSidebar } from "$lib/ui/sidebar-main/context.svelte";

	export const sidebarMenuButtonVariants = tv({
		base: "peer/menu-button ring-base-content/20 hover:bg-base-content/10 hover:text-base-content active:bg-base-content/10 active:text-base-content data-[active=true]:bg-base-content/10 data-[active=true]:text-base-content data-[state=open]:hover:bg-base-content/10 data-[state=open]:hover:text-base-content flex w-full items-center gap-2 overflow-clip rounded-md p-2 text-start text-sm outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pe-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
		variants: {
			variant: {
				default: "hover:bg-base-content/10 hover:text-base-content",
				outline:
					"bg-base-100 hover:bg-base-content/10 hover:text-base-content border border-base-300 hover:border-primary/50",
			},
			size: {
				default: "h-8 text-sm",
				sm: "h-7 text-xs",
				lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	type SidebarMenuButtonVariant = VariantProps<typeof sidebarMenuButtonVariants>["variant"];
	type SidebarMenuButtonSize = VariantProps<typeof sidebarMenuButtonVariants>["size"];

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		variant = "default",
		size = "default",
		isActive = false,
		tooltipContent,
		...restProps
	}: WithElementRef<HTMLButtonAttributes> & {
		isActive?: boolean;
		variant?: SidebarMenuButtonVariant;
		size?: SidebarMenuButtonSize;
		tooltipContent?: Snippet | string;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const sidebar = useSidebar();

	const buttonProps = $derived({
		class: cn(sidebarMenuButtonVariants({ variant, size }), className),
		"data-slot": "sidebar-menu-button",
		"data-sidebar": "menu-button",
		"data-size": size,
		"data-active": isActive,
		...restProps,
	});
</script>

{#if child}
	{@render child({ props: buttonProps })}
{:else}
	<button bind:this={ref} type="button" {...buttonProps}>
		{@render children?.()}
	</button>
{/if}
