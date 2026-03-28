<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: CommandPrimitive.LinkItemProps = $props();
</script>

<CommandPrimitive.LinkItem
	bind:ref
	data-slot="command-item"
	class={cn(
		"relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-base-content outline-hidden",
		"aria-selected:bg-base-200 aria-selected:text-base-content",
		"[&_svg:not([class*='text-'])]:text-base-content/60",
		"data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
		"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.LinkItem>
