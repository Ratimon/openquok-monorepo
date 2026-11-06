<script lang="ts">
	import type { PageData } from './$types';
	import DocsDocRenderer from '$lib/ui/components/docs/DocsDocRenderer.svelte';
	import DocsFooter from '$lib/ui/components/docs/layout/DocsFooter.svelte';
	import DocsKeyboardNav from '$lib/ui/components/docs/nav/DocsKeyboardNav.svelte';
	import DocsSeoHead from '$lib/ui/components/docs/DocsSeoHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let meta = $derived(data.meta);
	let howToBlocks = $derived(data.howToBlocks ?? []);
	let docImages = $derived(data.docImages ?? []);
	let codeBlocks = $derived(data.codeBlocks ?? []);
	let tables = $derived(data.tables ?? []);
	let slug = $derived(data.slug);
	let locale = $derived(data.locale);
	let prev = $derived(data.prev);
	let next = $derived(data.next);
	let rawContent = $derived(data.rawContent);
	let content = $derived(data.content);
	let loadContent = $derived(data.loadContent);
</script>

<DocsSeoHead
	title={meta.title}
	description={meta.description}
	ogImage={meta.ogImage}
	ogImageAlt={meta.ogImageAlt}
	{howToBlocks}
	{docImages}
	{codeBlocks}
	{tables}
/>

{#key slug}
	<DocsDocRenderer {meta} {content} {loadContent} {slug} {rawContent} {locale} />
{/key}
<DocsFooter {prev} {next} />
<DocsKeyboardNav {prev} {next} />
