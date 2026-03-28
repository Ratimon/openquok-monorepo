<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Textarea } from "$lib/ui/textarea/index.js";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...props
	}: ComponentProps<typeof Textarea> = $props();
</script>

<Textarea
	bind:ref
	data-slot="input-group-control"
	class={cn(
		"flex-1 resize-none rounded-none border-0 bg-transparent shadow-none",
		"focus-visible:ring-0 focus-visible:ring-offset-0",
		className
	)}
	bind:value
	{...props}
/>
