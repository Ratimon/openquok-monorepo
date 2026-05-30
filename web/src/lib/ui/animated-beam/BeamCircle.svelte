<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		class?: string;
		children: Snippet;
	};

	let { class: className = '', children }: Props = $props();
</script>

<div
	class={cn(
		'z-10 flex size-12 items-center justify-center rounded-full border-2 border-base-content/15 bg-base-100 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] transition-all duration-200',
		className
	)}
>
	{@render children()}
</div>
