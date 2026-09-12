import type { BreadcrumbList, ImageObject, ListItem, TechArticle, WebSite } from 'schema-dts';

import {
	DOCS_FALLBACK_SOCIAL_IMAGE_ALT,
	DOCS_FALLBACK_SOCIAL_IMAGE_SRC
} from '$lib/docs/constants/docsSeoDefaults';
import type { DocsHowToBlock } from '$lib/docs/utils/content/extractDocsHowToFromRaw';
import type { DocsImageFromRaw } from '$lib/docs/utils/content/extractDocsImagesFromRaw';
import { resolvePublicSiteUrl } from '$lib/docs/utils/site/resolvePublicSiteUrl';
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

/** Put the social preview image first for JSON-LD; prepend when it is not in body images. */
export function orderDocsImagesForSeo(
	docImages: DocsImageFromRaw[],
	params: { primarySrc?: string; primaryAlt?: string; pageTitle: string }
): DocsImageFromRaw[] {
	const primarySrc = params.primarySrc?.trim();
	if (!primarySrc) return docImages;

	const primaryAlt = params.primaryAlt?.trim();
	const existing = docImages.find((image) => image.src.trim() === primarySrc);
	if (existing) {
		const ordered = [existing, ...docImages.filter((image) => image.src.trim() !== primarySrc)];
		if (primaryAlt) {
			return ordered.map((image, index) => (index === 0 ? { ...image, alt: primaryAlt } : image));
		}
		return ordered;
	}

	return [{ src: primarySrc, alt: primaryAlt || params.pageTitle, index: 0 }, ...docImages];
}

export type DocsSocialPreview = {
	src: string;
	url: string;
	alt: string;
};

/** Social preview image: frontmatter override, else first inline doc image, else OpenQuok logo. */
export function pickDocsSocialPreview(params: {
	ogImage?: string;
	ogImageAlt?: string;
	title: string;
	docImages: DocsImageFromRaw[];
	resolveImageUrl: (src: string) => string;
	fallbackImageSrc?: string;
	fallbackImageAlt?: string;
}): DocsSocialPreview {
	const fallbackSrc = params.fallbackImageSrc?.trim() || DOCS_FALLBACK_SOCIAL_IMAGE_SRC;
	const fallbackAlt = params.fallbackImageAlt?.trim() || DOCS_FALLBACK_SOCIAL_IMAGE_ALT;

	const ogImage = params.ogImage?.trim();
	if (ogImage) {
		return {
			src: ogImage,
			url: params.resolveImageUrl(ogImage),
			alt: params.ogImageAlt?.trim() || params.title
		};
	}

	const first = params.docImages[0];
	if (first) {
		return {
			src: first.src,
			url: params.resolveImageUrl(first.src),
			alt: first.alt.trim() || params.title
		};
	}

	return {
		src: fallbackSrc,
		url: params.resolveImageUrl(fallbackSrc),
		alt: fallbackAlt
	};
}

/** Primary image for JSON-LD when the page has no `ogImage` and no inline screenshots. */
export function resolveDocsPrimaryImageForSeo(params: {
	ogImage?: string;
	ogImageAlt?: string;
	docImages: DocsImageFromRaw[];
	pageTitle: string;
}): { primarySrc?: string; primaryAlt?: string } {
	if (params.ogImage?.trim()) {
		return {
			primarySrc: params.ogImage.trim(),
			primaryAlt: params.ogImageAlt?.trim()
		};
	}

	if (params.docImages.length > 0) {
		return {};
	}

	return {
		primarySrc: DOCS_FALLBACK_SOCIAL_IMAGE_SRC,
		primaryAlt: DOCS_FALLBACK_SOCIAL_IMAGE_ALT
	};
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
