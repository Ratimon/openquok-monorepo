<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Input } from "$lib/ui/input/index.js";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...props
	}: ComponentProps<typeof Input> = $props();
</script>

<Input
	bind:ref
	data-slot="input-group-control"
	class={cn(
		"flex-1 rounded-none border-0 bg-transparent shadow-none",
		"focus-visible:ring-0 focus-visible:ring-offset-0",
		"aria-invalid:ring-0",
		className
	)}
	bind:value
	{...props}
/>
