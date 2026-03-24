<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		class?: string;
		children: Snippet;
	};

	let { class: className = '', children, ...rest }: Props = $props();

	const baseStyles =
		'max-w-screen stretch mx-auto flex flex-col px-4 md:px-6 lg:px-8';
</script>

<div class={cn(baseStyles, className)} {...rest}>
	{@render children?.()}
</div>
