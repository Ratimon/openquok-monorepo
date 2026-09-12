import {
	extractDocsHowToBlocksFromRaw,
	type DocsHowToBlock
} from '$lib/docs/utils/extractDocsHowToFromRaw';
import {
	dedupeDocsImagesFromRaw,
	extractDocsImagesFromRaw,
	type DocsImageFromRaw
} from '$lib/docs/utils/extractDocsImagesFromRaw';

export function buildDocsPageLoadExtras(rawContent: string): {
	howToBlocks: DocsHowToBlock[];
	docImages: DocsImageFromRaw[];
} {
	return {
		howToBlocks: extractDocsHowToBlocksFromRaw(rawContent),
		docImages: dedupeDocsImagesFromRaw(extractDocsImagesFromRaw(rawContent))
	};
}
