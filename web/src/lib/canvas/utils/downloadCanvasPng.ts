import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';

export type DownloadCanvasPngResult = { ok: true } | { ok: false; error: string };

export async function downloadCanvasPng(
	canvasApi: KonvaCanvasApi | null,
	filename = 'design.png'
): Promise<DownloadCanvasPngResult> {
	if (!canvasApi) {
		return { ok: false, error: 'Wait for the canvas to finish loading.' };
	}
	if (typeof document === 'undefined') {
		return { ok: false, error: 'Download is only available in the browser.' };
	}

	try {
		const blob = await canvasApi.toPngBlob();
		if (!blob) {
			return { ok: false, error: 'Could not export the canvas. Try again.' };
		}

		const objectUrl = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = objectUrl;
		anchor.download = filename;
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
		URL.revokeObjectURL(objectUrl);

		return { ok: true };
	} catch {
		return { ok: false, error: 'Could not export the canvas. Try again.' };
	}
}
