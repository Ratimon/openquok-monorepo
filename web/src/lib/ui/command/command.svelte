<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "$lib/ui/helpers/common";

	let {
		api = $bindable(null),
		ref = $bindable(null),
		value = $bindable(""),
		class: className,
		children,
		...restProps
	}: CommandPrimitive.RootProps & {
		/** Bits-ui Command root instance (imperative helpers). */
		api?: unknown;
	} = $props();
</script>

<CommandPrimitive.Root
	bind:this={api}
	bind:value
	bind:ref
	data-slot="command"
	class={cn("flex size-full flex-col overflow-hidden text-base-content", className)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Root>
