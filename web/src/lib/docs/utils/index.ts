export { calculateReadingTime } from '$lib/docs/utils/content/readingTime';
export { docMetaFromRawSource } from '$lib/docs/utils/content/parseDocFrontmatter';
export {
	dedupeDocsImagesFromRaw,
	extractDocsImagesFromRaw,
	type DocsImageFromRaw
} from '$lib/docs/utils/content/extractDocsImagesFromRaw';
export {
	extractDocsHowToBlocksFromRaw,
	type DocsHowToBlock,
	type DocsHowToStep
} from '$lib/docs/utils/content/extractDocsHowToFromRaw';
export { docsStepBodyToPlainText } from '$lib/docs/utils/content/docsStepBodyToPlainText';
export {
	buildDocsBreadcrumbListItems,
	resolveDocsPageUrl
} from '$lib/docs/utils/seo/buildDocsBreadcrumbJsonLd';
export { buildDocsPageLoadExtras } from '$lib/docs/utils/seo/buildDocsPageLoadExtras';
export {
	createDocsPageSeoSchema,
	orderDocsImagesForSeo,
	pickDocsSocialPreview,
	resolveDocsImageUrl,
	resolveDocsPrimaryImageForSeo,
	type CreateDocsPageSeoSchemaParams,
	type DocsSocialPreview
} from '$lib/docs/utils/seo/docsSeoSchema';
export {
	docsHttpMethodBadgeClass,
	httpMethodBadgeLabel,
	isOpenapiReferenceChrome,
	normalizeDocsLayout
} from '$lib/docs/utils/openapi/openapiDocsLayout';
export {
	fetchOpenapiOperationForDocs,
	type DocsParamLocation,
	type OpenapiDocsBodyPayload,
	type OpenapiDocsParamPayload,
	type OpenapiDocsResponsePayload
} from '$lib/docs/utils/openapi/openapiExamples';
export { highlightCode } from '$lib/docs/utils/openapi/shikiHighlight';
export {
	absoluteDocsUrl,
	canonicalDocsOrigin,
	docsMarkdownPath,
	docsPagePath
} from '$lib/docs/utils/site/docShareUrls';
export { docSectionKey, sidebarLabelForSection } from '$lib/docs/utils/site/docsSidebarLabel';
export { markdownResourceHeaders } from '$lib/docs/utils/site/markdownRouteHeaders';
export { mergeDocsUrlsIntoUrlset } from '$lib/docs/utils/site/mergeDocsSitemap';
export { resolvePublicSiteUrl } from '$lib/docs/utils/site/resolvePublicSiteUrl';
export { escapeXml } from '$lib/docs/utils/site/xmlEscape';
export { toc } from '$lib/docs/utils/ui/tocState.svelte';
