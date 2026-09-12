<script lang="ts">
	import { page } from '$app/state';
	import { docsConfig } from '$lib/docs/constants';
	import type { DocsHowToBlock } from '$lib/docs/utils/content/extractDocsHowToFromRaw';
	import type { DocsImageFromRaw } from '$lib/docs/utils/content/extractDocsImagesFromRaw';
	import {
		buildDocsBreadcrumbListItems,
		resolveDocsPageUrl
	} from '$lib/docs/utils/seo/buildDocsBreadcrumbJsonLd';
	import {
		createDocsPageSeoSchema,
		pickDocsSocialPreview,
		resolveDocsImageUrl
	} from '$lib/docs/utils/seo/docsSeoSchema';
	import { guessImageMimeFromFilename } from '$lib/seo/guessImageMimeFromFilename';
	import { jsonLdScriptHtml } from '$lib/seo/jsonLdScriptHtml';

	let {
		title,
		description,
		ogImage,
		ogImageAlt,
		howToBlocks = [],
		docImages = []
	}: {
		title: string;
		description?: string;
		ogImage?: string;
		ogImageAlt?: string;
		howToBlocks?: DocsHowToBlock[];
		docImages?: DocsImageFromRaw[];
	} = $props();

	let siteTitle = docsConfig.site.title;
	let fullTitle = $derived(title === siteTitle ? title : `${title} — ${siteTitle}`);
	let url = $derived(resolveDocsPageUrl(page.url.pathname, page.url));

	let breadcrumbItems = $derived(buildDocsBreadcrumbListItems(page.url.pathname, page.url));

	let socialPreview = $derived(
		pickDocsSocialPreview({
			ogImage,
			ogImageAlt,
			title,
			docImages,
			resolveImageUrl: (src) => resolveDocsImageUrl(src, page.url, url)
		})
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
			images: docImages,
			ogImage,
			ogImageAlt
		})
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
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
	{#if socialPreview}
		<meta property="og:image" content={socialPreview.url} />
		<meta property="og:image:alt" content={socialPreview.alt} />
		<meta property="og:image:type" content={guessImageMimeFromFilename(socialPreview.src)} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	{#if socialPreview}
		<meta name="twitter:image" content={socialPreview.url} />
		<meta name="twitter:image:alt" content={socialPreview.alt} />
	{/if}

	<link rel="canonical" href={url} />

	{@html jsonLdScriptHtml(schemaData)}
</svelte:head>
