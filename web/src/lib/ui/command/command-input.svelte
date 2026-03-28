<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import IconPlaceholder from "$lib/ui/icons/icon-placeholder.svelte";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(""),
		...restProps
	}: CommandPrimitive.InputProps = $props();
</script>

<div
	data-slot="command-input-wrapper"
	class="border-b border-base-300 bg-base-100 px-3 py-2"
>
	<label class="flex items-center gap-2">
		<span class="sr-only">Search</span>
		<IconPlaceholder name="Search" class="size-4 shrink-0 text-base-content/50" />
		<CommandPrimitive.Input
			data-slot="command-input"
			class={cn(
				"placeholder:text-base-content/40 flex min-w-0 flex-1 bg-transparent text-sm text-base-content outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			bind:ref
			bind:value
			{...restProps}
		/>
	</label>
</div>
