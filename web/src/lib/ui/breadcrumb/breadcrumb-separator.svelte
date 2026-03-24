<script lang="ts">
	import type { HTMLLiAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/ui/helpers/common";

	/**
	 * DaisyUI `.breadcrumbs` draws chevrons between adjacent `<li>` nodes.
	 * Default (no children): render a hidden `<li>` so shadcn-style composition
	 * (Item → Separator → Item) does not show duplicate separators.
	 */
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLLiAttributes> = $props();
</script>

{#if children}
	<li
		bind:this={ref}
		data-slot="breadcrumb-separator"
		role="presentation"
		aria-hidden="true"
		class={cn("flex items-center text-base-content/50 [&>svg]:size-3.5", className)}
		{...restProps}
	>
		{@render children?.()}
	</li>
{:else}
	<li
		bind:this={ref}
		data-slot="breadcrumb-separator"
		class="hidden"
		aria-hidden="true"
		role="presentation"
		{...restProps}
	></li>
{/if}
