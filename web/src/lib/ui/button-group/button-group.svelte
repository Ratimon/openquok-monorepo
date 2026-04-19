<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children }: Props = $props();
</script>

<div
	data-slot="button-group"
	role="group"
	class={cn(
		'flex w-full items-stretch overflow-hidden rounded-lg border border-base-300 bg-base-200/40 shadow-xs',
		className
	)}
>
	{@render children?.()}
</div>
