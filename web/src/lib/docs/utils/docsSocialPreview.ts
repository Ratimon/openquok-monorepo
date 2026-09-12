import type { DocsImageFromRaw } from '$lib/docs/utils/extractDocsImagesFromRaw';
import {
	DOCS_FALLBACK_SOCIAL_IMAGE_ALT,
	DOCS_FALLBACK_SOCIAL_IMAGE_SRC
} from '$lib/docs/constants/docsSeoDefaults';

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
