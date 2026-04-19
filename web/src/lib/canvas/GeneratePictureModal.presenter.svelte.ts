import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
import type { PostMediaProgrammerModel } from '$lib/posts';
import type { MediaRepository } from '$lib/media';

import type {
	DesignTemplateProgrammerModel,
	PolotnoTemplateListPageProgrammerModel,
	StockPhotoProgrammerModel
} from '$lib/canvas/CanvasDesign.repository.svelte';
import { canvasDesignRepository, CanvasDesignRepository } from '$lib/canvas/CanvasDesign.repository.svelte';

export type StockPhotoViewModel = StockPhotoProgrammerModel;

/** PM list + remote page fetch for the design templates side panel (UI receives this from the presenter). */
export type DesignTemplatesPanelSource = {
	readonly designTemplatesPm: readonly DesignTemplateProgrammerModel[];
	fetchPolotnoTemplateListPagePm: (
		params: { query: string; page: number },
		signal?: AbortSignal
	) => Promise<PolotnoTemplateListPageProgrammerModel>;
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

/** One instance per host surface (composer vs media library) so export/stock state stays isolated. */
export class GeneratePictureModalPresenter {

	readonly stockPhotosPm: readonly StockPhotoViewModel[];
	readonly designTemplatesPm: readonly DesignTemplateProgrammerModel[];

	constructor(
		private readonly mediaRepository: MediaRepository,
		private readonly designRepository: CanvasDesignRepository = canvasDesignRepository
	) {
		this.stockPhotosPm = designRepository.listStockPhotosPm();
		this.designTemplatesPm = designRepository.listDesignTemplatesPm();
	}

	fetchPolotnoTemplateListPagePm(
		params: { query: string; page: number },
		signal?: AbortSignal
	): Promise<PolotnoTemplateListPageProgrammerModel> {
		const apiKey =
			(typeof import.meta.env.VITE_POLOTNO_API_KEY === 'string' && import.meta.env.VITE_POLOTNO_API_KEY) ||
			'';
		return this.designRepository.fetchPolotnoTemplateListPagePm({ ...params, apiKey }, signal);
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
