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
import { fetchOpenapiOperationForDocs } from '$lib/docs/utils/openapi/openapiExamples';

export type BuildDocsPageLoadExtrasOptions = {
	meta?: Pick<DocMeta, 'title' | 'openapi'>;
	/** Request origin for OpenAPI spec fetch during SSR / prerender. */
	origin?: string;
};

async function fetchOpenApiSeoCodeBlocks(params: {
	openapi: string;
	title: string;
	origin: string;
	startIndex: number;
}): Promise<DocsCodeBlockFromRaw[]> {
	const result = await fetchOpenapiOperationForDocs(params.openapi, '/api/v1/openapi.json', params.origin);
	if (!result.ok) return [];

	return result.payload.clientSamples.map((sample, offset) => ({
		index: params.startIndex + offset,
		language: sample.shikiLanguage,
		text: sample.code,
		name: `${params.title} — ${sample.label} request example`
	}));
}

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
