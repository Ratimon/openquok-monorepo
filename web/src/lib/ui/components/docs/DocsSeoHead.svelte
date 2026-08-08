<script lang="ts">
	import type { BreadcrumbList, TechArticle, WebSite, WithContext } from 'schema-dts';

	import { page } from '$app/state';
	import { docsConfig } from '$lib/docs/constants';
	import {
		buildDocsBreadcrumbListItems,
		resolveDocsPageUrl
	} from '$lib/docs/utils/buildDocsBreadcrumbJsonLd';
	import { resolvePublicSiteUrl } from '$lib/docs/utils/resolve-public-site-url';
	import { createJsonLdWithContext, SCHEMA_ORG_CONTEXT } from '$lib/seo/jsonLdSchema';
	import { jsonLdScriptHtml } from '$lib/seo/jsonLdScriptHtml';

	let {
		title,
		description
	}: {
		title: string;
		description?: string;
	} = $props();

	let siteTitle = docsConfig.site.title;
	let fullTitle = $derived(title === siteTitle ? title : `${title} — ${siteTitle}`);
	let siteOrigin = $derived(resolvePublicSiteUrl(page.url));
	// Prerender-safe: pathname + configured origin only (no query string).
	let url = $derived(resolveDocsPageUrl(page.url.pathname, page.url));

	let breadcrumbItems = $derived(buildDocsBreadcrumbListItems(page.url.pathname, page.url));

	let schemaData = $derived([
		createJsonLdWithContext({
			'@type': 'TechArticle',
			headline: title,
			description: description ?? '',
			url,
			isPartOf: {
				'@type': 'WebSite',
				name: siteTitle,
				url: siteOrigin
			} satisfies WebSite
		} satisfies TechArticle),
		{
			'@context': SCHEMA_ORG_CONTEXT,
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbItems
		} satisfies WithContext<BreadcrumbList>
	]);
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

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={fullTitle} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}

	<link rel="canonical" href={url} />

	{@html jsonLdScriptHtml(schemaData)}
</svelte:head>
