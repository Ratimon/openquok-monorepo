<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { type WithElementRef } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLLIElement>> = $props();
</script>

<li bind:this={ref} {...restProps}>
	{@render children?.()}
</li>
