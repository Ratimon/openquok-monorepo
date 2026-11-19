<script lang="ts">
	import type { Snippet } from 'svelte';

	import HighlightedText from '$lib/ui/texts/HighlightedText.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		children?: Snippet;
		class?: string;
		delay?: number;
		triggerOnView?: boolean;
	};

	let { children, class: className, delay = 0, triggerOnView = true }: Props = $props();
</script>

<HighlightedText
	class={cn('-rotate-1 rounded-md', className)}
	backgroundClass="bg-white"
	textClass="px-2 py-0.5 text-black sm:px-3 sm:py-1"
	{delay}
	{triggerOnView}
>
	{@render children?.()}
</HighlightedText>
