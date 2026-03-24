<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithoutChildren, type WithElementRef } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLSpanElement>>> = $props();
</script>

<span
	bind:this={ref}
	data-slot="breadcrumb-ellipsis"
	role="presentation"
	aria-hidden="true"
	class={cn(
		"inline-flex size-9 shrink-0 items-center justify-center rounded-field text-base-content/60",
		className
	)}
	{...restProps}
>
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
		class="size-4"
		aria-hidden="true"
	>
		<circle cx="12" cy="12" r="1" />
		<circle cx="19" cy="12" r="1" />
		<circle cx="5" cy="12" r="1" />
	</svg>
	<span class="sr-only">More</span>
</span>
