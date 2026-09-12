import type { BreadcrumbList, ImageObject, ListItem, TechArticle, WebSite } from 'schema-dts';

import type { DocsHowToBlock } from '$lib/docs/utils/extractDocsHowToFromRaw';
import type { DocsImageFromRaw } from '$lib/docs/utils/extractDocsImagesFromRaw';
import { orderDocsImagesForSeo, resolveDocsPrimaryImageForSeo } from '$lib/docs/utils/docsSocialPreview';
import { resolvePublicSiteUrl } from '$lib/docs/utils/resolve-public-site-url';
import { createHowToSEOSchema } from '$lib/seo/createHowToSEOSchema';
import { guessImageMimeFromFilename } from '$lib/seo/guessImageMimeFromFilename';
import {
	createJsonLdGraph,
	filterNonEmptyJsonLdNodes,
	type JsonLdGraphSchema
} from '$lib/seo/jsonLdSchema';

function docsTechArticleId(canonicalUrl: string): string {
	return `${canonicalUrl}#techarticle`;
}

function docsImageObjectId(canonicalUrl: string, index: number): string {
	return `${canonicalUrl}#doc-image-${index + 1}`;
}

function jsonLdNodeRef(id: string): { '@id': string } {
	return { '@id': id };
}

function jsonLdNodeRefs(ids: string[]): { '@id': string } | { '@id': string }[] {
	return ids.length === 1 ? jsonLdNodeRef(ids[0]) : ids.map((id) => jsonLdNodeRef(id));
}

/** Resolve authored image paths to absolute URLs for JSON-LD and Open Graph. */
export function resolveDocsImageUrl(src: string, requestUrl: URL, canonicalUrl: string): string {
	const trimmed = src.trim();
	if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

	const origin = resolvePublicSiteUrl(requestUrl);
	if (trimmed.startsWith('/')) {
		return new URL(trimmed, `${origin}/`).href;
	}

	return new URL(trimmed, `${canonicalUrl}/`).href;
}

function createDocsImageObjectNodes(params: {
	images: DocsImageFromRaw[];
	canonicalUrl: string;
	requestUrl: URL;
	techArticleId: string;
	pageTitle: string;
}): ImageObject[] {
	const { images, canonicalUrl, requestUrl, techArticleId, pageTitle } = params;

	return images.map((image, index) => {
		const contentUrl = resolveDocsImageUrl(image.src, requestUrl, canonicalUrl);
		const caption = image.alt.trim();
		const isPrimary = index === 0;

		return {
			'@type': 'ImageObject',
			'@id': docsImageObjectId(canonicalUrl, index),
			url: contentUrl,
			contentUrl,
			encodingFormat: guessImageMimeFromFilename(image.src),
			...(caption ? { caption } : { name: `Illustration in ${pageTitle}` }),
			...(isPrimary ? { representativeOfPage: true } : {}),
			isPartOf: jsonLdNodeRef(techArticleId)
		} satisfies ImageObject;
	});
}

export type CreateDocsPageSeoSchemaParams = {
	title: string;
	description?: string;
	canonicalUrl: string;
	requestUrl: URL;
	siteTitle: string;
	breadcrumbItems: ListItem[];
	howToBlocks?: DocsHowToBlock[];
	images?: DocsImageFromRaw[];
	/** Frontmatter override for the primary / social preview image. */
	ogImage?: string;
	ogImageAlt?: string;
};

/** JSON-LD `@graph` for a docs page: `TechArticle`, breadcrumbs, optional HowTo, and inline images. */
export function createDocsPageSeoSchema(params: CreateDocsPageSeoSchemaParams): JsonLdGraphSchema {
	const {
		title,
		description,
		canonicalUrl,
		requestUrl,
		siteTitle,
		breadcrumbItems,
		howToBlocks = [],
		images = [],
		ogImage,
		ogImageAlt
	} = params;

	const siteOrigin = resolvePublicSiteUrl(requestUrl);
	const techArticleId = docsTechArticleId(canonicalUrl);
	const primaryImage = resolveDocsPrimaryImageForSeo({
		ogImage,
		ogImageAlt,
		docImages: images,
		pageTitle: title
	});
	const orderedImages = orderDocsImagesForSeo(images, {
		primarySrc: primaryImage.primarySrc,
		primaryAlt: primaryImage.primaryAlt,
		pageTitle: title
	});
	const imageNodes = createDocsImageObjectNodes({
		images: orderedImages,
		canonicalUrl,
		requestUrl,
		techArticleId,
		pageTitle: title
	});

	const techArticle: TechArticle = {
		'@type': 'TechArticle',
		'@id': techArticleId,
		headline: title,
		description: description?.trim() || undefined,
		url: canonicalUrl,
		isPartOf: {
			'@type': 'WebSite',
			name: siteTitle,
			url: siteOrigin
		} satisfies WebSite
	};

	if (imageNodes.length === 1) {
		techArticle.image = jsonLdNodeRef(String(imageNodes[0]['@id']));
	} else if (imageNodes.length > 1) {
		techArticle.image = jsonLdNodeRef(String(imageNodes[0]['@id']));
		techArticle.associatedMedia = jsonLdNodeRefs(
			imageNodes.slice(1).map((node) => String(node['@id']))
		);
	}

	const breadcrumbList: BreadcrumbList = {
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbItems
	};

	const howToNodes = filterNonEmptyJsonLdNodes(
		howToBlocks.map((block, index) =>
			createHowToSEOSchema({
				canonicalUrl,
				fragmentId: howToBlocks.length === 1 ? 'howto' : `howto-${index + 1}`,
				name: block.name,
				description: block.description,
				steps: block.steps
			})
		)
	);

	return createJsonLdGraph([techArticle, breadcrumbList, ...imageNodes, ...howToNodes]);
}
