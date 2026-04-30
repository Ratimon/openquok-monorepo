import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
import type { PostMediaProgrammerModel } from '$lib/posts';
import type { MediaRepository } from '$lib/medias';

import type {
	DesignTemplateProgrammerModel,
	PolotnoTemplateListPageProgrammerModel,
	PolotnoUnsplashListPageProgrammerModel,
	StockPhotoProgrammerModel
} from '$lib/canvas/CanvasDesign.repository.svelte';
import { canvasDesignRepository, CanvasDesignRepository } from '$lib/canvas/CanvasDesign.repository.svelte';

export type StockPhotoViewModel = StockPhotoProgrammerModel;

/** VM bundle: template list + remote page fetch for the design templates side panel. */
export type DesignTemplatesPanelVm = {
	readonly designTemplatesVm: readonly DesignTemplateProgrammerModel[];
	fetchPolotnoTemplateListPagePm: (
		params: { query: string; page: number },
		signal?: AbortSignal
	) => Promise<PolotnoTemplateListPageProgrammerModel>;
};

/** VM bundle: Unsplash search + download ping for the background side panel. */
export type BackgroundPanelVm = {
	fetchPolotnoUnsplashPagePm: (
		params: { query: string; page: number },
		signal?: AbortSignal
	) => Promise<PolotnoUnsplashListPageProgrammerModel>;
	triggerPolotnoUnsplashDownloadPm: (id: string) => void;
};

export type ExportDesignToMediaResult =
	| { ok: true; items: PostMediaProgrammerModel[] }
	| { ok: false; error: string };

export type ExportCanvasToMediaArgs = {
	canvasApi: KonvaCanvasApi | null;
	uploadUid: string;
	disabled: boolean;
};

export type ExportCanvasToMediaFn = (args: ExportCanvasToMediaArgs) => Promise<ExportDesignToMediaResult>;

export class GenerateMediaModalPresenter {
	readonly stockPhotosVm: readonly StockPhotoViewModel[];
	readonly designTemplatesVm: readonly DesignTemplateProgrammerModel[];
	/**
	 * Bundled Unsplash fetch + download ping for the background panel (no static list — results are
	 * paginated from Polotno, unlike {@link stockPhotosVm}).
	 */
	readonly backgroundPanelVm: BackgroundPanelVm;

	constructor(
		private readonly mediaRepository: MediaRepository,
		private readonly designRepository: CanvasDesignRepository = canvasDesignRepository
	) {
		this.stockPhotosVm = designRepository.listStockPhotosPm();
		this.designTemplatesVm = designRepository.listDesignTemplatesPm();
		this.backgroundPanelVm = {
			fetchPolotnoUnsplashPagePm: (params, signal) =>
				this.fetchPolotnoUnsplashPagePm(params, signal),
			triggerPolotnoUnsplashDownloadPm: (id) => this.triggerPolotnoUnsplashDownloadPm(id)
		};
	}

	private polotnoApiKey(): string {
		return (
			(typeof import.meta.env.VITE_POLOTNO_API_KEY === 'string' && import.meta.env.VITE_POLOTNO_API_KEY) ||
			''
		);
	}

	fetchPolotnoTemplateListPagePm(
		params: { query: string; page: number },
		signal?: AbortSignal
	): Promise<PolotnoTemplateListPageProgrammerModel> {
		return this.designRepository.fetchPolotnoTemplateListPagePm(
			{ ...params, apiKey: this.polotnoApiKey() },
			signal
		);
	}

	fetchPolotnoUnsplashPagePm(
		params: { query: string; page: number },
		signal?: AbortSignal
	): Promise<PolotnoUnsplashListPageProgrammerModel> {
		return this.designRepository.fetchPolotnoUnsplashPagePm(
			{ ...params, apiKey: this.polotnoApiKey() },
			signal
		);
	}

	triggerPolotnoUnsplashDownloadPm(id: string): void {
		this.designRepository.triggerPolotnoUnsplashDownloadPm(id, this.polotnoApiKey());
	}

	async exportCanvasToMedia(args: ExportCanvasToMediaArgs): Promise<ExportDesignToMediaResult> {
		const { canvasApi, uploadUid, disabled } = args;
		if (!canvasApi || disabled) {
			return { ok: false, error: 'Wait for the canvas to finish loading.' };
		}
		try {
			const blob = await canvasApi.toPngBlob();
			if (!blob) {
				return { ok: false, error: 'Could not export the canvas. Try again.' };
			}
			const file = new File([blob], 'canvas.png', { type: 'image/png' });
			const result = await this.mediaRepository.uploadMedia(file, uploadUid);
			if (result.success && result.data.filePath) {
				return {
					ok: true,
					items: [
						{
							id: crypto.randomUUID(),
							path: result.data.filePath,
							bucket: 'social_media'
						}
					]
				};
			}
			return { ok: false, error: result.message || 'Upload failed.' };
		} catch {
			return { ok: false, error: 'Could not export the canvas. Try again.' };
		}
	}
}
