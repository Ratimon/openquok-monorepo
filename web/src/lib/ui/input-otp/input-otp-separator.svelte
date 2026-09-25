<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="input-otp-separator"
	role="separator"
	aria-hidden="true"
	class={cn('flex w-6 shrink-0 items-center justify-center sm:w-8', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<div class="bg-base-content/25 h-0.5 w-3 rounded-full"></div>
	{/if}
</div>
