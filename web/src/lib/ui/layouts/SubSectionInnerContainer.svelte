<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...rest }: Props = $props();

	const baseStyles = 'flex flex-col w-full max-w-3xl xl:max-w-4xl mx-auto';
</script>

<div class={cn(baseStyles, className)} {...rest}>
	{@render children?.()}
</div>
