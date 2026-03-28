<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	const inputGroupButtonVariants = tv({
		base: "flex shrink-0 items-center shadow-none",
		variants: {
			size: {
				xs: "h-7 min-h-7 min-w-7 px-2 text-xs",
				sm: "h-8 min-h-8 min-w-8 px-2.5 text-sm",
				"icon-xs": "size-7 min-h-7 min-w-7 p-0",
				"icon-sm": "size-8 min-h-8 min-w-8 p-0",
			},
		},
		defaultVariants: {
			size: "xs",
		},
	});

	export type InputGroupButtonSize = VariantProps<typeof inputGroupButtonVariants>["size"];
</script>

<script lang="ts">
	import type { ComponentProps } from "svelte";
	import Button from "$lib/ui/buttons/Button.svelte";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		type = "button",
		variant = "ghost",
		size = "xs",
		...restProps
	}: Omit<ComponentProps<typeof Button>, "href" | "size"> & {
		size?: InputGroupButtonSize;
	} = $props();
</script>

<Button
	bind:ref
	{type}
	data-size={size}
	{variant}
	class={cn(inputGroupButtonVariants({ size }), "rounded-none", className)}
	{...restProps}
>
	{@render children?.()}
</Button>
