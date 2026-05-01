<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/ui/helpers/common";
	import { icons } from "$data/icons";
	import AbstractIcon from "$lib/ui/icons/AbstractIcon.svelte";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		children: childrenProp,
		...restProps
	}: WithoutChildrenOrChild<DropdownMenuPrimitive.CheckboxItemProps> & {
		children?: Snippet;
	} = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
	bind:ref
	bind:checked
	bind:indeterminate
	data-slot="dropdown-menu-checkbox-item"
	class={cn(
		"text-base-content data-[highlighted]:bg-base-200 data-[highlighted]:text-base-content outline-none relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 ps-8 pe-2 text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		className
	)}
	{...restProps}
>
	{#snippet children({ checked, indeterminate })}
		<span
			class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center"
		>
			{#if indeterminate}
				<span class="block h-0.5 w-2.5 shrink-0 rounded-full bg-current" aria-hidden="true"></span>
			{:else}
				<AbstractIcon
					name={icons.Check.name}
					class={cn("size-4", !checked && "opacity-0")}
					width="16"
					height="16"
					focusable="false"
				/>
			{/if}
		</span>
		{@render childrenProp?.()}
	{/snippet}
</DropdownMenuPrimitive.CheckboxItem>
