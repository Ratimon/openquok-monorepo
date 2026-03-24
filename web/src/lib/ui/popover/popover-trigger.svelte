<script lang="ts">
	import { cn } from "$lib/ui/helpers/common";
	import { Popover as PopoverPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: PopoverPrimitive.TriggerProps = $props();
</script>

<PopoverPrimitive.Trigger
	bind:ref
	class={cn(className)}
	{...restProps}
/>
