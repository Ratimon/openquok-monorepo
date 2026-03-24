<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.DescriptionProps = $props();
</script>

<DialogPrimitive.Description
	bind:ref
	data-slot="dialog-description"
	class={cn("text-base-content/70 text-sm", className)}
	{...restProps}
/>
