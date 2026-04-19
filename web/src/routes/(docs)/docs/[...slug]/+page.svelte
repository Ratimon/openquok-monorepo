<script lang="ts">
	import type { PageData } from './$types';
	import DocsDocRenderer from '$lib/ui/components/docs/DocsDocRenderer.svelte';
	import DocsFooter from '$lib/ui/components/docs/layout/DocsFooter.svelte';
	import DocsKeyboardNav from '$lib/ui/components/docs/nav/DocsKeyboardNav.svelte';
	import DocsSeoHead from '$lib/ui/components/docs/DocsSeoHead.svelte';
	import { getDoc } from '$lib/docs/index';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let meta = $derived(data.meta);
	let slug = $derived(data.slug);
	let prev = $derived(data.prev);
	let next = $derived(data.next);
	let rawContent = $derived(data.rawContent);

	let doc = $derived(getDoc(slug));
</script>

<DocsSeoHead title={meta.title} description={meta.description} />

{#if doc}
	<DocsDocRenderer meta={doc.meta} loadContent={doc.loadContent} {slug} {rawContent} />
{/if}
<DocsFooter {prev} {next} />
<DocsKeyboardNav {prev} {next} />
