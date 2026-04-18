/**
 * Design canvas stock imagery (deterministic preview tiles; public CDN; no API key).
 * Repository boundary for static PM — swap implementation when a real stock API is wired.
 */
export type StockPhotoProgrammerModel = {
	id: string;
	thumbUrl: string;
	fullUrl: string;
	/**
	 * Lowercase, space-separated tokens for client-side search (local filter until an API exists).
	 */
	searchText: string;
};

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

function buildStockPhotosPm(): StockPhotoProgrammerModel[] {
	return Array.from({ length: 72 }, (_, i) => {
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
}

export class CanvasDesignRepository {
	private readonly cache: readonly StockPhotoProgrammerModel[];

	constructor() {
		this.cache = Object.freeze(buildStockPhotosPm());
	}

	/** Curated stock rows for the design picker (PM). */
	listStockPhotosPm(): readonly StockPhotoProgrammerModel[] {
		return this.cache;
	}
}

export const canvasDesignRepository = new CanvasDesignRepository();
