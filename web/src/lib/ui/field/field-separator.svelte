<script lang="ts">
	import { cn, type WithElementRef } from '$lib/ui/helpers/common';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & { children?: Snippet } = $props();
</script>

{#if children}
	<div
		bind:this={ref}
		data-slot="field-separator"
		role="separator"
		class={cn('divider', className)}
		{...restProps}
	>
		{@render children()}
	</div>
{:else}
	<div
		bind:this={ref}
		data-slot="field-separator"
		role="separator"
		class={cn('divider my-2', className)}
		{...restProps}
	></div>
{/if}

