<script lang="ts">
	import { page } from '$app/state';

	import { prepareBlogRichTextForDisplay } from '$lib/blogs/utils';
	import { cn } from '$lib/ui/helpers/common';
	import { rewriteHtmlHostedMarketingHrefs } from '$lib/utils/hostedMarketingHref';

	type Props = {
		/** CMS / catalog copy — plain text or HTML from `faqLink` helpers. */
		html: string;
		class?: string;
		/** Default `p` for hero and section descriptions. */
		tag?: 'p' | 'div';
	};

	let { html, class: className = '', tag = 'p' }: Props = $props();

	const renderedHtml = $derived(
		rewriteHtmlHostedMarketingHrefs(
			prepareBlogRichTextForDisplay(html),
			page.url.origin
		)
	);
</script>

<svelte:element
	this={tag}
	class={cn(
		'select-text [&_p]:m-0 [&_p+p]:mt-3 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-90',
		className
	)}
>
	{@html renderedHtml}
</svelte:element>