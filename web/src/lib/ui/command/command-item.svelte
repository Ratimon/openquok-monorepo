<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import IconPlaceholder from "$lib/ui/icons/icon-placeholder.svelte";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: CommandPrimitive.ItemProps = $props();
</script>

<CommandPrimitive.Item
	bind:ref
	data-slot="command-item"
	class={cn(
		"group/command-item relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-base-content outline-hidden",
		"data-[selected]:bg-base-200 data-[selected]:text-base-content data-[selected]:*:[svg]:text-base-content",
		"in-data-[slot=dialog-content]:rounded-lg!",
		"data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
		"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<IconPlaceholder
		name="Check"
		class="ms-auto size-4 shrink-0 opacity-0 group-data-[selected]/command-item:opacity-100 group-has-[[data-slot=command-shortcut]]/command-item:hidden"
	/>
</CommandPrimitive.Item>
