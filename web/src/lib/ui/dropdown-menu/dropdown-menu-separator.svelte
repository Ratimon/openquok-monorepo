<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DropdownMenuPrimitive.SeparatorProps = $props();
</script>

<DropdownMenuPrimitive.Separator
	bind:ref
	data-slot="dropdown-menu-separator"
	class={cn("bg-base-300 pointer-events-none -mx-1 my-1 h-px shrink-0", className)}
	{...restProps}
/>
