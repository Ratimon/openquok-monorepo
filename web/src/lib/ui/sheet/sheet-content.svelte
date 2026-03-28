<script lang="ts" module>
	export type Side = "top" | "right" | "bottom" | "left";
</script>

<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { ComponentProps } from "svelte";
	import SheetOverlay from "$lib/ui/sheet/sheet-overlay.svelte";
	import SheetPortal from "$lib/ui/sheet/sheet-portal.svelte";
	import { cn, type WithoutChildrenOrChild } from "$lib/ui/helpers/common";

	const sideClasses: Record<Side, string> = {
		top: "inset-x-0 top-0 max-h-[85vh] w-full rounded-b-xl border-b border-base-300 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom:
			"inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-xl border-t border-base-300 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 max-w-sm rounded-r-xl border-r border-base-300 data-[state=closed]:slide-out-to-left-10 data-[state=open]:slide-in-from-left-10 sm:max-w-sm",
		right:
			"inset-y-0 right-0 h-full w-3/4 max-w-sm rounded-l-xl border-l border-base-300 data-[state=closed]:slide-out-to-right-10 data-[state=open]:slide-in-from-right-10 sm:max-w-sm",
	};

	let {
		ref = $bindable(null),
		class: className,
		side = "right",
		showCloseButton = true,
		portalProps,
		children,
		...restProps
	}: WithoutChildrenOrChild<SheetPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SheetPortal>>;
		side?: Side;
		showCloseButton?: boolean;
		children: Snippet;
	} = $props();
</script>

<SheetPortal {...portalProps}>
	<SheetOverlay />
	<SheetPrimitive.Content
		bind:ref
		data-slot="sheet-content"
		data-side={side}
		class={cn(
			"fixed z-50 flex flex-col gap-4 bg-base-100 p-6 text-base-content shadow-lg outline-none",
			"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
			"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
			sideClasses[side],
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		{#if showCloseButton}
			<SheetPrimitive.Close
				class="ring-offset-base-100 focus:ring-primary absolute end-4 top-4 rounded-md p-2 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-base-content"
					aria-hidden="true"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
				<span class="sr-only">Close</span>
			</SheetPrimitive.Close>
		{/if}
	</SheetPrimitive.Content>
</SheetPortal>
