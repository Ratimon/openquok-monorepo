<!-- https://github.com/huntabyte/shadcn-svelte/tree/c33a1adf533b71297208b2c74d723849d398e001/docs/src/lib/registry/ui/slider -->
<script lang="ts">
	import { Slider as SliderPrimitive } from "bits-ui";
	import type { ComponentProps } from "svelte";
	import { cn } from "$lib/ui/helpers/common";

	/** Headless root props narrowed to `type="single"` so `bind:value` and the children snippet type-check. */
	type SliderRootProps = ComponentProps<typeof SliderPrimitive.Root>;
	type SingleSliderProps = Omit<
		Extract<SliderRootProps, { type: "single" }>,
		"children" | "child" | "type"
	>;

	let {
		ref = $bindable(null),
		value = $bindable<number>(),
		orientation = "horizontal",
		class: className,
		...restProps
	}: SingleSliderProps = $props();
</script>

<SliderPrimitive.Root
	bind:ref
	bind:value
	type="single"
	data-slot="slider"
	{orientation}
	class={cn(
		"relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col",
		className
	)}
	{...restProps}
>
	{#snippet children({ thumbItems })}
		<span
			data-slot="slider-track"
			data-orientation={orientation}
			class={cn(
				"relative grow overflow-hidden rounded-full bg-base-200 data-horizontal:w-full data-vertical:h-full"
			)}
		>
			<SliderPrimitive.Range
				data-slot="slider-range"
				class={cn(
					"absolute select-none rounded-full bg-primary data-horizontal:h-full data-vertical:w-full"
				)}
			/>
		</span>
		{#each thumbItems as thumb (thumb)}
			<SliderPrimitive.Thumb
				data-slot="slider-thumb"
				index={thumb.index}
				class={cn(
					"block size-4 shrink-0 rounded-full border border-base-300 bg-base-100 shadow-sm select-none outline-none",
					"focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100",
					"disabled:pointer-events-none disabled:opacity-50"
				)}
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
