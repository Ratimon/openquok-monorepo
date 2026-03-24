<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...rest }: Props = $props();

	const baseStyles =
		'font-semibold tracking-tight text-3xl md:text-4xl text-base-content';
</script>

<h1 class={cn(baseStyles, className)} {...rest}>
	{@render children?.()}
</h1>
