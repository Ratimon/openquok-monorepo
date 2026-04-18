/** Snapshot for toolbar UI (selection on the Konva stage). */
export type CanvasSelectionState = {
	hasSelection: boolean;
	type?: 'image' | 'text';
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

export type KonvaCanvasApi = {
	toPngBlob: () => Promise<Blob | null>;
	addImageFromUrl: (url: string) => void;
	addImageFromFile: (file: File) => void;
	setPageBackground: (cssColor: string) => void;
	/** Apply a full template snapshot (text + images). */
	applyTemplateDoc: (doc: import('$lib/ui/canvas-editor/utils/canvasDoc').KonvaDesignDoc, mode?: CanvasTemplateApplyMode) => void;
	/** Layout box for mapping external template coordinates (e.g. Polotno JSON) onto the canvas. */
	getPageInnerBox: () => PageInnerBox;
	/** Insert a preset text block centered on the page (scaled to frame size). Optional drop coordinates are stage pixels; optional font overrides the preset default. */
	addTextPreset: (
		preset: TextPresetId,
		opts?: { dropX?: number; dropY?: number; fontFamily?: string }
	) => void;
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
};
