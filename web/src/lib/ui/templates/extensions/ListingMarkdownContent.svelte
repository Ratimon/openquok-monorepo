<script lang="ts">
	import { markdownToHtml } from '$lib/listings/utils/markdownToHtml';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		markdown: string | null | undefined;
		class?: string;
		emptyMessage?: string;
	};

	let { markdown, class: className = '', emptyMessage = 'No documentation yet.' }: Props = $props();

	const html = $derived(markdownToHtml(markdown ?? ''));
</script>

{#if html}
	<div class={cn('prose prose-neutral dark:prose-invert max-w-none', className)}>
		<!-- eslint-disable svelte/no-at-html-tags -->
		{@html html}
	</div>
{:else}
	<p class="text-base-content/70">{emptyMessage}</p>
{/if}
