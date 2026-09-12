<script lang="ts">
	import { page } from '$app/state';
	import { docsConfig } from '$lib/docs/constants';
	import type { DocsHowToBlock } from '$lib/docs/utils/extractDocsHowToFromRaw';
	import type { DocsImageFromRaw } from '$lib/docs/utils/extractDocsImagesFromRaw';
	import {
		buildDocsBreadcrumbListItems,
		resolveDocsPageUrl
	} from '$lib/docs/utils/buildDocsBreadcrumbJsonLd';
	import { createDocsPageSeoSchema, resolveDocsImageUrl } from '$lib/docs/utils/createDocsPageSeoSchema';
	import { jsonLdScriptHtml } from '$lib/seo/jsonLdScriptHtml';

	let {
		title,
		description,
		howToBlocks = [],
		docImages = []
	}: {
		title: string;
		description?: string;
		howToBlocks?: DocsHowToBlock[];
		docImages?: DocsImageFromRaw[];
	} = $props();

	let siteTitle = docsConfig.site.title;
	let fullTitle = $derived(title === siteTitle ? title : `${title} — ${siteTitle}`);
	// Prerender-safe: pathname + configured origin only (no query string).
	let url = $derived(resolveDocsPageUrl(page.url.pathname, page.url));

	let breadcrumbItems = $derived(buildDocsBreadcrumbListItems(page.url.pathname, page.url));

	let primaryDocImage = $derived(docImages[0] ?? null);
	let primaryDocImageUrl = $derived(
		primaryDocImage ? resolveDocsImageUrl(primaryDocImage.src, page.url, url) : ''
	);

	let schemaData = $derived(
		createDocsPageSeoSchema({
			title,
			description,
			canonicalUrl: url,
			requestUrl: page.url,
			siteTitle,
			breadcrumbItems,
			howToBlocks,
			images: docImages
		})
	);
</script>

<svelte:head>
	<title>
		{fullTitle}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}

	<meta property="og:type" content="article" />
	<meta property="og:title" content={fullTitle} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:url" content={url} />
	{#if docsConfig.site.title}
		<meta property="og:site_name" content={docsConfig.site.title} />
	{/if}
	{#if primaryDocImageUrl}
		<meta property="og:image" content={primaryDocImageUrl} />
		<meta property="og:image:alt" content={primaryDocImage?.alt || title} />
	{/if}

	<meta
		name="twitter:card"
		content={primaryDocImageUrl ? 'summary_large_image' : 'summary'}
	/>
	<meta name="twitter:title" content={fullTitle} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	{#if primaryDocImageUrl}
		<meta name="twitter:image" content={primaryDocImageUrl} />
		<meta name="twitter:image:alt" content={primaryDocImage?.alt || title} />
	{/if}

	<link rel="canonical" href={url} />

	{@html jsonLdScriptHtml(schemaData)}
</svelte:head>
