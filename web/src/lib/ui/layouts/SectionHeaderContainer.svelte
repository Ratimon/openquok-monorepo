<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		class?: string;
		children: Snippet;
	};

	let { class: className = '', children, ...rest }: Props = $props();

	const baseStyles =
		'flex flex-col gap-4 pt-8 pb-6 text-center max-w-2xl mx-auto md:pt-10 md:pb-8';
</script>

<div class={cn(baseStyles, className)} {...rest}>
	{@render children?.()}
</div>
