import type { AspectRatioPreset } from '$lib/ui/canvas-editor/utils/aspectRatioPresets';

import { PAGE_MARGIN, PAGE_MARGIN_EMBEDDED } from './constants';

export type PageRectLayout = { px: number; py: number; pw: number; ph: number };

/**
 * Fits the white page rectangle inside the stage with the given aspect preset
 * (letterboxed inside the inner area after margin).
 */
export function computePageLayout(
	sw: number,
	sh: number,
	embedded: boolean,
	preset: Pick<AspectRatioPreset, 'ratioW' | 'ratioH'>
): PageRectLayout {
	const margin = embedded ? PAGE_MARGIN_EMBEDDED : PAGE_MARGIN;
	const innerW = Math.max(100, sw - margin * 2);
	const innerH = Math.max(100, sh - margin * 2);
	const { ratioW, ratioH } = preset;
	const mediaAspect = ratioW / ratioH;
	const boxAspect = innerW / innerH;
	let pw: number;
	let ph: number;
	if (boxAspect > mediaAspect) {
		ph = innerH;
		pw = Math.max(1, Math.round((innerH * ratioW) / ratioH));
	} else {
		pw = innerW;
		ph = Math.max(1, Math.round((innerW * ratioH) / ratioW));
	}
	const px = margin + (innerW - pw) / 2;
	const py = margin + (innerH - ph) / 2;
	return { px, py, pw, ph };
}
