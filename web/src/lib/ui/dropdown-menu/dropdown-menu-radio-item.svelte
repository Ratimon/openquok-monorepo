<script lang="ts">
	import type { WithoutChild } from "bits-ui";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children: childrenProp,
		...restProps
	}: WithoutChild<DropdownMenuPrimitive.RadioItemProps> = $props();
</script>

<DropdownMenuPrimitive.RadioItem
	bind:ref
	data-slot="dropdown-menu-radio-item"
	class={cn(
		"text-base-content data-[highlighted]:bg-base-200 data-[highlighted]:text-base-content outline-none relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 ps-8 pe-2 text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		className
	)}
	{...restProps}
>
	{#snippet children({ checked })}
		<span
			class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center"
		>
			{#if checked}
				<span class="size-2 shrink-0 rounded-full bg-current" aria-hidden="true"></span>
			{/if}
		</span>
		{@render childrenProp?.({ checked })}
	{/snippet}
</DropdownMenuPrimitive.RadioItem>
