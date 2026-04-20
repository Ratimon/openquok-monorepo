/** Snapshot for toolbar UI (selection on the Konva stage). */
export type CanvasSelectionState = {
	hasSelection: boolean;
	/** Stage node ids for the current transformer selection (top-most first when multiple). */
	selectedIds: string[];
	type?: 'image' | 'text' | 'drawStroke';
	/** 0–100; meaningful when `hasSelection`. */
	opacity: number;
	/** When true, the selection cannot be dragged (still transformable). */
	locked: boolean;
	/** Text-only selection details (when `type === 'text'`). */
	text?: {
		value: string;
		fontFamily: string;
		fontSize: number;
		fill: string;
		fontStyle: string;
		align: 'left' | 'center' | 'right' | 'justify';
	};
};

export type TextPresetId = 'header' | 'subheader' | 'body';

export type CanvasTemplateApplyMode = 'reset';

/** Inner page rect in stage coordinates (content area inside the frame). */
export type PageInnerBox = { px: number; py: number; pw: number; ph: number };

export type CanvasEditorMode = 'selection' | 'draw';

export type CanvasDrawBrushType = 'brush' | 'highlighter';

export type CanvasDrawSettings = {
	editorMode: CanvasEditorMode;
	brushType: CanvasDrawBrushType;
	strokeWidth: number;
	strokeColor: string;
	/** 0–100; applies to brush only (highlighter uses tool defaults). */
	brushOpacityPercent: number;
};

export type CanvasLayerKind = 'image' | 'text' | 'drawStroke';

/** One row for the layers side panel (top-most layer first). */
export type CanvasLayerItem = {
	id: string;
	kind: CanvasLayerKind;
	typeLabel: string;
	displayName: string;
	visible: boolean;
	locked: boolean;
};

export type KonvaCanvasApi = {
	toPngBlob: () => Promise<Blob | null>;
	addImageFromUrl: (url: string) => void;
	addImageFromFile: (file: File) => void;
	/** Solid CSS color or an image URL (`https`, `blob`, `data:image…`); images are scaled to cover the page. */
	setPageBackground: (fill: string) => void;
	/** Apply a full template snapshot (text + images). */
	applyTemplateDoc: (doc: import('$lib/ui/canvas-editor/utils/canvasDoc').KonvaDesignDoc, mode?: CanvasTemplateApplyMode) => void;
	/** Layout box for mapping external template coordinates (e.g. Polotno JSON) onto the canvas. */
	getPageInnerBox: () => PageInnerBox;
	/** Insert a preset text block centered on the page (scaled to frame size). Optional drop coordinates are stage pixels; optional font overrides the preset default. */
	addTextPreset: (
		preset: TextPresetId,
		opts?: { dropX?: number; dropY?: number; fontFamily?: string }
	) => void;
	/**
	 * Merge Polotno text-template JSON into the current page (same placement as the text panel).
	 * Does not replace the full document.
	 */
	applyPolotnoTextTemplate: (
		json: unknown,
		opts?: { dropX?: number; dropY?: number }
	) => Promise<void>;
	/** Reassign every text node using `fromFamily` to `toFamily` (e.g. after removing a custom font). */
	retargetTextFontFamily: (fromFamily: string, toFamily: string) => void;
	/** Remove every placed image and text; page fill and aspect are unchanged unless you set them separately. */
	clearAllImages: () => void;
	undo: () => void;
	redo: () => void;
	canUndo: () => boolean;
	canRedo: () => boolean;
	/** Latest selection snapshot (also pushed via `onSelectionChange` on the canvas). */
	getSelectionState: () => CanvasSelectionState;
	/** Text editing (no-op if selection is not text). */
	setSelectedText: (value: string) => void;
	setSelectedFontFamily: (fontFamily: string) => void;
	setSelectedFontSize: (px: number) => void;
	setSelectedFill: (cssColor: string) => void;
	toggleSelectedBold: () => void;
	toggleSelectedItalic: () => void;
	setSelectedTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => void;
	removeSelected: () => void;
	duplicateSelected: () => void;
	setSelectedOpacity: (percent: number) => void;
	setSelectedLocked: (locked: boolean) => void;
	moveSelectedForward: () => void;
	moveSelectedBackward: () => void;
	moveSelectedToFront: () => void;
	moveSelectedToBack: () => void;
	alignSelected: (
		mode: 'left' | 'centerH' | 'right' | 'top' | 'centerV' | 'bottom'
	) => void;
	canMoveSelectedForward: () => boolean;
	canMoveSelectedBackward: () => boolean;
	/** Record the current document as a new undo step (e.g. after opacity slider release). */
	commitEdit: () => void;

	/** Selection vs freehand draw on the page. */
	setCanvasEditorMode: (mode: CanvasEditorMode) => void;
	setDrawBrushType: (type: CanvasDrawBrushType) => void;
	setDrawStrokeWidth: (px: number) => void;
	setDrawStrokeColor: (cssColor: string) => void;
	/** 0–100; only affects the brush tool. */
	setDrawBrushOpacityPercent: (percent: number) => void;
	getDrawSettings: () => CanvasDrawSettings;

	/** Layers ordered top → bottom (same order as the layers panel list). */
	getLayerList: () => CanvasLayerItem[];
	/** Replace selection with these node ids, or merge with current selection when `additive` is true. */
	selectLayers: (ids: string[], opts?: { additive?: boolean }) => void;
	/** Reorder stacked elements; `ids` is top → bottom. */
	setLayerOrderTopFirst: (ids: string[]) => void;
	removeLayersByIds: (ids: string[]) => void;
	setLayerVisible: (id: string, visible: boolean) => void;
	setLayerLocked: (id: string, locked: boolean) => void;
	/** Persisted optional name in the document (empty string clears the custom label). */
	setLayerDisplayName: (id: string, label: string) => void;
};
