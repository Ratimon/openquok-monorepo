import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
import type { PostMediaProgrammerModel } from '$lib/posts';
import type { MediaRepository } from '$lib/media';

import type { StockPhotoProgrammerModel } from '$lib/canvas/CanvasDesign.repository.svelte';
import { canvasDesignRepository, CanvasDesignRepository } from '$lib/canvas/CanvasDesign.repository.svelte';

export type StockPhotoViewModel = StockPhotoProgrammerModel;

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

	constructor(
		private readonly mediaRepository: MediaRepository,
		designRepository: CanvasDesignRepository = canvasDesignRepository
	) {
		this.stockPhotosPm = designRepository.listStockPhotosPm();
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
