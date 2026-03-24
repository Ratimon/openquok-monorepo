<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		class?: string;
		children: Snippet;
	};

	let { class: className = '', children, ...rest }: Props = $props();

	const baseStyles = 'mt-2 text-sm md:text-base text-base-content/80';
</script>

<p class={cn(baseStyles, className)} {...rest}>
	{@render children?.()}
</p>
