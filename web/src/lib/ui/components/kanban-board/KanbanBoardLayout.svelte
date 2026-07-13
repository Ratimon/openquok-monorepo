<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		class?: string;
		children: Snippet;
	};

	let { class: className = '', children }: Props = $props();
</script>

<div class={cn('flex gap-3 overflow-x-auto pb-2', className)} role="list">
	{@render children()}
</div>
