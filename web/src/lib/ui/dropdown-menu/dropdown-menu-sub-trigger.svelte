<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		inset,
		children,
		...restProps
	}: DropdownMenuPrimitive.SubTriggerProps & {
		inset?: boolean;
	} = $props();
</script>

<DropdownMenuPrimitive.SubTrigger
	bind:ref
	data-slot="dropdown-menu-sub-trigger"
	data-inset={inset}
	class={cn(
		"text-base-content outline-none flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm data-[highlighted]:bg-base-200 data-[highlighted]:text-base-content data-[state=open]:bg-base-200 data-[state=open]:text-base-content [&_svg:not([class*='text-'])]:text-base-content/60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:ps-8",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="ms-auto size-4 shrink-0"
		aria-hidden="true"
	>
		<path d="m9 18 6-6-6-6" />
	</svg>
</DropdownMenuPrimitive.SubTrigger>
