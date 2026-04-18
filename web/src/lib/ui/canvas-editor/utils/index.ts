export { deepEqual } from '$lib/ui/canvas-editor/utils/deepEqual';
export { HistoryStack } from '$lib/ui/canvas-editor/utils/historyStack';
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
export { measureFont, type FontMetrics } from '$lib/ui/canvas-editor/utils/font-metric';
export {
	ASPECT_RATIO_PLATFORM_GROUPS,
	ASPECT_RATIO_PRESETS,
	aspectPlatformGroupIdForProviderIdentifier,
	aspectPresetDisplayLine,
	defaultAspectRatioIdForComposer,
	DEFAULT_ASPECT_RATIO_ID,
	firstAspectPresetIdInGroup,
	getAspectPresetById,
	type AspectPlatformGroup,
	type AspectRatioPreset
} from '$lib/ui/canvas-editor/utils/aspectRatioPresets';
