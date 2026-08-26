import {
	extractDocsHowToBlocksFromRaw,
	type DocsHowToBlock
} from '$lib/docs/utils/extractDocsHowToFromRaw';

export function buildDocsPageLoadExtras(rawContent: string): { howToBlocks: DocsHowToBlock[] } {
	return {
		howToBlocks: extractDocsHowToBlocksFromRaw(rawContent)
	};
}
