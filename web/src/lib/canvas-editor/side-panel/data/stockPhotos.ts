/** Deterministic preview tiles for the design picker (public image CDN; no API key). */
export type StockPhotoEntry = {
	id: string;
	thumbUrl: string;
	fullUrl: string;
	/**
	 * Lowercase, space-separated tokens for client-side search (mirrors “query drives results”
	 * without a stock API until one is wired).
	 */
	searchText: string;
};

/** Topic-like tokens so search matches everyday terms (local filter only). */
const SEARCH_TOPICS = [
	'nature',
	'city',
	'people',
	'ocean',
	'sky',
	'food',
	'travel',
	'abstract',
	'minimal',
	'urban',
	'mountain',
	'water',
	'sunset',
	'forest',
	'beach',
	'night',
	'architecture',
	'texture',
	'winter',
	'spring',
	'summer',
	'autumn',
	'road',
	'coffee',
	'workspace',
	'landscape',
	'portrait',
	'light',
	'pattern',
	'outdoor',
	'indoor',
	'color',
	'monochrome',
	'vintage',
	'modern',
	'wildlife',
	'plant',
	'street',
	'desert',
	'jungle',
	'lake',
	'bridge',
	'neon',
	'bokeh',
	'geometric',
	'cozy',
	'cafe',
	'aerial',
	'macro',
	'flower',
	'rain',
	'fog',
	'canyon',
	'valley',
	'studio',
	'flatlay',
	'rustic',
	'tech',
	'gradient',
	'silhouette',
	'reflection',
	'golden hour',
	'blue hour'
] as const;

export const STOCK_PHOTOS: StockPhotoEntry[] = Array.from({ length: 72 }, (_, i) => {
	const seed = `openquokdm${i}`;
	const a = SEARCH_TOPICS[i % SEARCH_TOPICS.length];
	const b = SEARCH_TOPICS[(i + 9) % SEARCH_TOPICS.length];
	const searchText = `${seed} ${a} ${b} photo image stock`.toLowerCase();
	return {
		id: seed,
		thumbUrl: `https://picsum.photos/seed/${seed}/120/150`,
		fullUrl: `https://picsum.photos/seed/${seed}/900/1125`,
		searchText
	};
});
