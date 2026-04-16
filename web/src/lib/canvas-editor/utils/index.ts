export { deepEqual } from './deepEqual';
export { HistoryStack } from './historyStack';
export type {
	KonvaDesignDoc,
	KonvaDesignImageNode,
	KonvaDesignNode,
	KonvaDesignTextNode
} from './canvasDoc';
export {
	addGlobalFont,
	getFontsList,
	getGoogleFontsUrl,
	globalFonts,
	injectGoogleFont,
	isFontLoaded,
	isGoogleFontChanged,
	loadFont,
	removeGlobalFont,
	setGoogleFonts,
	setGoogleFontsVariants
} from './fonts';
export { measureFont, type FontMetrics } from './font-metric';
export {
	ASPECT_RATIO_PRESETS,
	DEFAULT_ASPECT_RATIO_ID,
	getAspectPresetById,
	type AspectRatioPreset
} from './aspectRatioPresets';
