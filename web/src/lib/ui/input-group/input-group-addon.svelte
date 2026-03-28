<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	export const inputGroupAddonVariants = tv({
		base: "flex cursor-text items-center justify-center gap-1 select-none text-sm text-base-content/70",
		variants: {
			align: {
				"inline-start": "order-first px-2.5",
				"inline-end": "order-last px-2.5",
				"block-start": "order-first w-full justify-start px-2.5 pb-1 pt-2",
				"block-end": "order-last w-full justify-start px-2.5 pb-2 pt-1",
			},
		},
		defaultVariants: {
			align: "inline-start",
		},
	});

	export type InputGroupAddonAlign = VariantProps<typeof inputGroupAddonVariants>["align"];
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		align = "inline-start",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		align?: InputGroupAddonAlign;
	} = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="input-group-addon"
	data-align={align}
	class={cn(inputGroupAddonVariants({ align }), className)}
	onclick={(e) => {
		if ((e.target as HTMLElement).closest("button")) {
			return;
		}
		const field = e.currentTarget.parentElement?.querySelector(
			"input, textarea"
		) as HTMLElement | null;
		field?.focus();
	}}
	{...restProps}
>
	{@render children?.()}
</div>
