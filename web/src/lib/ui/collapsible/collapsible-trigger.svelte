<script lang="ts">
	import { Collapsible as CollapsiblePrimitive } from "bits-ui";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: CollapsiblePrimitive.TriggerProps = $props();
</script>

<CollapsiblePrimitive.Trigger
	bind:ref
	data-slot="collapsible-trigger"
	class={cn(
		"text-base-content ring-base-content/20 flex w-full items-center justify-between gap-2 rounded-md p-2 text-start text-sm font-medium outline-hidden transition-[color,background-color] focus-visible:ring-2",
		"hover:bg-base-content/10 data-[state=open]:bg-base-content/10",
		"disabled:pointer-events-none disabled:opacity-50",
		"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-base-content/60",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</CollapsiblePrimitive.Trigger>
