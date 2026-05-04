/**
 * Design canvas data: stock imagery (local PM) and Polotno template list (HTTP via {@link HttpGateway}).
 * ProgrammerModel types and stock PM construction live here with the repository boundary.
 */
import { HttpGateway } from '$lib/core/HttpGateway';

import type { KonvaDesignDoc } from '$lib/ui/canvas-editor/utils/canvasDoc';

import {
	POLOTONO_API_ORIGIN,
	POLOTONO_DEFAULT_TEMPLATE_PER_PAGE,
	POLOTONO_DEFAULT_UNSPLASH_PER_PAGE,
	POLOTONO_DOWNLOAD_UNSPLASH_PATH,
	POLOTONO_GET_TEMPLATES_PATH,
	POLOTONO_GET_TEXT_TEMPLATES_PATH,
	POLOTONO_GET_UNSPLASH_PATH
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
	/** Present for Unsplash-backed rows (Polotno proxy). */
	photographerName?: string;
	/** Profile URL with referral params for attribution. */
	photographerHref?: string;
};

/** Raw page from Polotno `get-unsplash` (Unsplash-style JSON). */
export type PolotnoUnsplashApiPageProgrammerModel = {
	results?: PolotnoUnsplashApiPhotoProgrammerModel[];
	total_pages?: number;
};

export type PolotnoUnsplashApiPhotoProgrammerModel = {
	id: string;
	urls?: {
		small?: string;
		regular?: string;
		thumb?: string;
		full?: string;
	};
	user?: {
		name?: string;
		username?: string;
	};
};

/** Normalized page for infinite scroll (`items` matches {@link createInfiniteApi} flattening). */
export type PolotnoUnsplashListPageProgrammerModel = {
	items: StockPhotoProgrammerModel[];
	totalPages: number;
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

/** Polotno `get-text-templates` row (preview + JSON URL). */
export type PolotnoTextTemplateRowProgrammerModel = {
	json: string;
	preview: string;
};

export type PolotnoTextTemplatesListProgrammerModel = {
	items?: PolotnoTextTemplateRowProgrammerModel[];
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

/** Design dialog template row; structurally identical to {@link DesignTemplateProgrammerModel}. */
export type DesignTemplateViewModel = DesignTemplateProgrammerModel;

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
	 * One page of Unsplash results via Polotno (`/api/get-unsplash`), for background picker search.
	 */
	async fetchPolotnoUnsplashPagePm(
		params: {
			query: string;
			page: number;
			perPage?: number;
			apiKey?: string;
		},
		signal?: AbortSignal
	): Promise<PolotnoUnsplashListPageProgrammerModel> {
		const perPage = params.perPage ?? POLOTONO_DEFAULT_UNSPLASH_PER_PAGE;
		const key = params.apiKey ?? '';
		const res = await this.polotnoGateway.get<PolotnoUnsplashApiPageProgrammerModel>(
			POLOTONO_GET_UNSPLASH_PATH,
			{
				query: params.query,
				per_page: perPage,
				page: params.page,
				KEY: key
			},
			{ signal, skipInterceptors: true }
		);
		const raw = res.data;
		const results = raw.results ?? [];
		const items: StockPhotoProgrammerModel[] = results.map((r) => {
			const urls = r.urls ?? {};
			const thumbUrl = urls.small ?? urls.thumb ?? urls.regular ?? '';
			const fullUrl = urls.regular ?? urls.full ?? thumbUrl;
			const un = r.user?.username ?? '';
			const name = r.user?.name ?? '';
			const photographerHref = un
				? `https://unsplash.com/@${un}?utm_source=polotno&utm_medium=referral`
				: undefined;
			return {
				id: r.id,
				thumbUrl,
				fullUrl,
				searchText: `${r.id} ${un} ${name}`.toLowerCase(),
				photographerName: name || undefined,
				photographerHref
			};
		});
		const totalPages = Math.max(1, raw.total_pages ?? 1);
		return { items, totalPages };
	}

	/**
	 * Notify Polotno/Unsplash when a stock image is placed (same as OpenPolotno `fetch(unsplashDownload(id))`).
	 */
	triggerPolotnoUnsplashDownloadPm(id: string, apiKey?: string): void {
		const key = apiKey ?? '';
		const url = `${POLOTONO_API_ORIGIN}${POLOTONO_DOWNLOAD_UNSPLASH_PATH}?${new URLSearchParams({
			id,
			KEY: key
		}).toString()}`;
		void fetch(url, { method: 'GET', mode: 'cors' }).catch(() => {
			/* attribution ping is best-effort */
		});
	}

	/**
	 * One page from Polotno’s public template list (`/api/get-templates`).
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

	/** Polotno public text-style templates (`/api/get-text-templates`). */
	async fetchPolotnoTextTemplatesListPm(
		params: { apiKey?: string },
		signal?: AbortSignal
	): Promise<PolotnoTextTemplatesListProgrammerModel> {
		const key = params.apiKey ?? '';
		const res = await this.polotnoGateway.get<PolotnoTextTemplatesListProgrammerModel>(
			POLOTONO_GET_TEXT_TEMPLATES_PATH,
			{ KEY: key },
			{ signal, skipInterceptors: true }
		);
		return res.data;
	}
}

export const canvasDesignRepository = new CanvasDesignRepository();
