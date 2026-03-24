<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/ui/helpers/common";
	import { cn } from "$lib/ui/helpers/common";

	export type AlertVariant = "info" | "success" | "warning" | "error" | "neutral";

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: AlertVariant;
	};

	let {
		ref = $bindable(null),
		class: className,
		variant = "neutral",
		children,
		...restProps
	}: Props = $props();

	const variantClass = $derived.by(() => {
		switch (variant) {
			case "info":
				return "alert-info";
			case "success":
				return "alert-success";
			case "warning":
				return "alert-warning";
			case "error":
				return "alert-error";
			default:
				return "";
		}
	});
</script>

<div
	bind:this={ref}
	data-slot="alert"
	role="alert"
	class={cn("alert", variantClass, className)}
	{...restProps}
>
	{@render children?.()}
</div>

