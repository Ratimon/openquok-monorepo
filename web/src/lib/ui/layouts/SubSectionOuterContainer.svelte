<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		class?: string;
		children: Snippet;
	};

	let { class: className = '', children, ...rest }: Props = $props();
</script>

<div class={cn('mx-auto w-full py-6 md:py-10 px-4 xl:px-0', className)} {...rest}>
	{@render children?.()}
</div>
