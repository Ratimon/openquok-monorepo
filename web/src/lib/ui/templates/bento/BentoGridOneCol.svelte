<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		class?: string;
		children: Snippet;
	};

	let { class: className = '', children }: Props = $props();
</script>

<div class={cn('grid w-full auto-rows-[minmax(18rem,auto)] grid-cols-1 gap-4', className)}>
	{@render children()}
</div>
