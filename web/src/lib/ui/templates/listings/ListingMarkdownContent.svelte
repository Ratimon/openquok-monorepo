<script lang="ts">
	import ListingRichMarkdown from '$lib/ui/templates/listings/ListingRichMarkdown.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		markdown: string | null | undefined;
		class?: string;
		emptyMessage?: string;
	};

	let { markdown, class: className = '', emptyMessage = 'No documentation yet.' }: Props = $props();
</script>

<ListingRichMarkdown {markdown} {emptyMessage} class={cn('prose-headings:scroll-mt-20', className)} />
