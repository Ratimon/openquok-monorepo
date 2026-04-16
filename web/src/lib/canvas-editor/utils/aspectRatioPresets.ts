export type AspectRatioPreset = {
	id: string;
	/** Shown in the menu, e.g. "16:9" */
	label: string;
	ratioW: number;
	ratioH: number;
	/** Target pixel size for PNG export (matches the ratio). */
	exportWidth: number;
	exportHeight: number;
	/** Optional one-line note for the UI (e.g. vertical video). */
	hint?: string;
};

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
	{ id: '21:9', label: '21:9', ratioW: 21, ratioH: 9, exportWidth: 2520, exportHeight: 1080 },
	{ id: '16:9', label: '16:9', ratioW: 16, ratioH: 9, exportWidth: 1920, exportHeight: 1080 },
	{
		id: '5:4',
		label: '5:4',
		ratioW: 5,
		ratioH: 4,
		exportWidth: 1280,
		exportHeight: 1024
	},
	{ id: '4:3', label: '4:3', ratioW: 4, ratioH: 3, exportWidth: 1600, exportHeight: 1200 },
	{ id: '3:2', label: '3:2', ratioW: 3, ratioH: 2, exportWidth: 1800, exportHeight: 1200 },
	{ id: '1:1', label: '1:1', ratioW: 1, ratioH: 1, exportWidth: 1080, exportHeight: 1080 },
	{ id: '2:3', label: '2:3', ratioW: 2, ratioH: 3, exportWidth: 1080, exportHeight: 1620 },
	{ id: '3:4', label: '3:4', ratioW: 3, ratioH: 4, exportWidth: 1080, exportHeight: 1440 },
	{ id: '4:5', label: '4:5', ratioW: 4, ratioH: 5, exportWidth: 1080, exportHeight: 1350 },
	{
		id: '9:16',
		label: '9:16',
		ratioW: 9,
		ratioH: 16,
		exportWidth: 1080,
		exportHeight: 1920,
		hint: 'Vertical video (1080×1920): short-form feeds and full-screen mobile.'
	}
];

export const DEFAULT_ASPECT_RATIO_ID = '16:9';

export function getAspectPresetById(id: string): AspectRatioPreset {
	return (
		ASPECT_RATIO_PRESETS.find((p) => p.id === id) ??
		ASPECT_RATIO_PRESETS.find((p) => p.id === DEFAULT_ASPECT_RATIO_ID)!
	);
}
