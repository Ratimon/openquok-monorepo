/**
 * Design canvas data: stock imagery (local PM) and Polotno template list (HTTP via {@link HttpGateway}).
 * ProgrammerModel types and stock PM construction live here with the repository boundary.
 */
import { HttpGateway } from '$lib/core/HttpGateway';

import type { KonvaDesignDoc } from '$lib/ui/canvas-editor/utils/canvasDoc';

import {
	POLOTONO_API_ORIGIN,
	POLOTONO_DEFAULT_TEMPLATE_PER_PAGE,
	POLOTONO_GET_TEMPLATES_PATH
} from '$lib/canvas/constants/polotno';
import { DESIGN_TEMPLATES_PM } from '$lib/canvas/constants/CanvasDesign.templates.data';

export type StockPhotoProgrammerModel = {
	id: string;
	thumbUrl: string;
	fullUrl: string;
	/**
	 * Lowercase, space-separated tokens for client-side search (local filter until an API exists).
	 */
	searchText: string;
};

/** Polotno public template row (same shape as `get-templates` items). */
export type PolotnoTemplateRowProgrammerModel = {
	json: string;
	preview: string;
};

export type PolotnoTemplateListPageProgrammerModel = {
	hits?: number;
	totalPages: number;
	items: PolotnoTemplateRowProgrammerModel[];
};

export type DesignTemplateProgrammerModel = {
	id: string;
	label: string;
	description?: string;
	previewUrl: string;
	/** Doc snapshot to apply to the canvas (resetting history). */
	doc: KonvaDesignDoc;
	/** If set, row is shown regardless of canvas aspect when lists filter by aspect. */
	universal?: boolean;
	/** Optional aspect id when lists filter templates to the current frame. */
	aspectRatioId?: string;
	/** If set, parent should switch to this aspect before applying fill/clear. */
	suggestAspectRatioId?: string;
};

/** Topic tokens for deterministic Lorem Picsum stock rows (client-side search). */
export const STOCK_PHOTO_SEARCH_TOPICS = [
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

export const STOCK_PHOTO_TILE_COUNT = 72;
export const STOCK_PHOTO_SEED_PREFIX = 'openquokdm';
export const STOCK_PHOTO_THUMB_WIDTH = 120;
export const STOCK_PHOTO_THUMB_HEIGHT = 150;
export const STOCK_PHOTO_FULL_WIDTH = 900;
export const STOCK_PHOTO_FULL_HEIGHT = 1125;

/** Exported for tests or tooling that need the same deterministic grid without the repository singleton. */
export function buildStockPhotosPm(): StockPhotoProgrammerModel[] {
	return Array.from({ length: STOCK_PHOTO_TILE_COUNT }, (_, i) => {
		const seed = `${STOCK_PHOTO_SEED_PREFIX}${i}`;
		const a = STOCK_PHOTO_SEARCH_TOPICS[i % STOCK_PHOTO_SEARCH_TOPICS.length];
		const b = STOCK_PHOTO_SEARCH_TOPICS[(i + 9) % STOCK_PHOTO_SEARCH_TOPICS.length];
		const searchText = `${seed} ${a} ${b} photo image stock`.toLowerCase();
		return {
			id: seed,
			thumbUrl: `https://picsum.photos/seed/${seed}/${STOCK_PHOTO_THUMB_WIDTH}/${STOCK_PHOTO_THUMB_HEIGHT}`,
			fullUrl: `https://picsum.photos/seed/${seed}/${STOCK_PHOTO_FULL_WIDTH}/${STOCK_PHOTO_FULL_HEIGHT}`,
			searchText
		};
	});
}

export class CanvasDesignRepository {
	private readonly stockPhotosPm: readonly StockPhotoProgrammerModel[];
	private readonly designTemplatesPm: readonly DesignTemplateProgrammerModel[];
	private readonly polotnoGateway: HttpGateway;

	constructor() {
		this.stockPhotosPm = Object.freeze(buildStockPhotosPm());
		this.designTemplatesPm = Object.freeze([...DESIGN_TEMPLATES_PM]);
		this.polotnoGateway = new HttpGateway(POLOTONO_API_ORIGIN, {
			headers: {
				Accept: 'application/json'
			}
		});
	}

	/** Curated stock rows for the design picker (PM). */
	listStockPhotosPm(): readonly StockPhotoProgrammerModel[] {
		return this.stockPhotosPm;
	}

	/** Built-in Konva templates for the design picker (PM). */
	listDesignTemplatesPm(): readonly DesignTemplateProgrammerModel[] {
		return this.designTemplatesPm;
	}

	/**
	 * One page of Polotno’s public template library (same contract as OpenPolotno `templateList`).
	 * Uses `size=all` (we do not filter remote templates by export dimensions).
	 */
	async fetchPolotnoTemplateListPagePm(
		params: {
			query: string;
			page: number;
			perPage?: number;
			apiKey?: string;
		},
		signal?: AbortSignal
	): Promise<PolotnoTemplateListPageProgrammerModel> {
		const perPage = params.perPage ?? POLOTONO_DEFAULT_TEMPLATE_PER_PAGE;
		const key = params.apiKey ?? '';
		const res = await this.polotnoGateway.get<PolotnoTemplateListPageProgrammerModel>(
			POLOTONO_GET_TEMPLATES_PATH,
			{
				size: 'all',
				query: params.query,
				per_page: perPage,
				page: params.page,
				KEY: key
			},
			{ signal, skipInterceptors: true }
		);
		return res.data;
	}
}

export const canvasDesignRepository = new CanvasDesignRepository();
