<script lang="ts">
	import { parseInlineMarkdown } from '$lib/listings/utils/listingMarkdown';
	import { externalLinkRelForHref } from '$lib/utils/externalLinkRel';

	import { Badge } from '$lib/ui/badge';

	type Props = {
		text: string;
	};

	let { text }: Props = $props();

	const segments = $derived(parseInlineMarkdown(text));

	function linkRel(href: string): string {
		return externalLinkRelForHref(href.trim()) ?? '';
	}
</script>

{#each segments as segment, index (index)}
	{#if segment.type === 'text'}
		{segment.text}
	{:else if segment.type === 'bold'}
		<strong>{segment.text}</strong>
	{:else if segment.type === 'em'}
		<em>{segment.text}</em>
	{:else if segment.type === 'code'}
		{#if segment.asBadge}
			<Badge variant="muted" class="mx-0.5 align-middle font-mono text-[0.7rem]">{segment.text}</Badge>
		{:else}
			<code class="rounded bg-base-content/10 px-1 py-0.5 font-mono text-[0.85em]">{segment.text}</code>
		{/if}
	{:else if segment.type === 'link'}
		{@const href = segment.href.trim()}
		{#if /^https?:\/\//i.test(href)}
			<a
				{href}
				target="_blank"
				rel={linkRel(href)}
				class="font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary"
			>
				{segment.label}
			</a>
		{:else}
			{segment.label}
		{/if}
	{/if}
{/each}
