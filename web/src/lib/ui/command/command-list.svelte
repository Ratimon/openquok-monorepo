<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: CommandPrimitive.ListProps = $props();
</script>

<CommandPrimitive.List
	bind:ref
	data-slot="command-list"
	class={cn("max-h-[min(50vh,320px)] overflow-x-hidden overflow-y-auto text-base-content", className)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.List>
