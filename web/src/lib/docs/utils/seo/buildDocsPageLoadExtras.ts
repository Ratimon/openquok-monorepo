import {
	extractDocsCodeBlocksFromRaw,
	type DocsCodeBlockFromRaw
} from '$lib/docs/utils/content/extractDocsCodeBlocksFromRaw';
import {
	extractDocsHowToBlocksFromRaw,
	type DocsHowToBlock
} from '$lib/docs/utils/content/extractDocsHowToFromRaw';
import {
	dedupeDocsImagesFromRaw,
	extractDocsImagesFromRaw,
	type DocsImageFromRaw
} from '$lib/docs/utils/content/extractDocsImagesFromRaw';
import type { DocMeta } from '$lib/docs/types';

export type BuildDocsPageLoadExtrasOptions = {
	meta?: Pick<DocMeta, 'title' | 'openapi'>;
	/** Request origin for OpenAPI spec fetch during SSR / prerender. */
	origin?: string;
};

export async function buildDocsPageLoadExtras(
	rawContent: string,
	options?: BuildDocsPageLoadExtrasOptions
): Promise<{
	howToBlocks: DocsHowToBlock[];
	docImages: DocsImageFromRaw[];
	codeBlocks: DocsCodeBlockFromRaw[];
}> {
	const howToBlocks = extractDocsHowToBlocksFromRaw(rawContent);
	const docImages = dedupeDocsImagesFromRaw(extractDocsImagesFromRaw(rawContent));
	const codeBlocks = extractDocsCodeBlocksFromRaw(rawContent);

	const openapiLine = options?.meta?.openapi?.trim();
	const origin = options?.origin?.trim();
	const pageTitle = options?.meta?.title?.trim();

	if (openapiLine && origin && pageTitle) {
		const { fetchOpenApiSeoCodeBlocks } =
			await import('$lib/docs/utils/openapi/openapiSeoClientSamples');
		const openApiBlocks = await fetchOpenApiSeoCodeBlocks({
			openapi: openapiLine,
			title: pageTitle,
			origin,
			startIndex: codeBlocks.length
		});
		codeBlocks.push(...openApiBlocks);
	}

	return {
		howToBlocks,
		docImages,
		codeBlocks
	};
}
