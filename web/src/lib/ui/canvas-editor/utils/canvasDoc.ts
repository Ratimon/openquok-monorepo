/** Serializable design document for the Konva page (export / undo). */
export type KonvaDesignDoc = {
	/** Solid CSS color, or an image URL (`https`, `blob`, or `data:image…`) for a cropped page background. */
	pageFill: string;
	nodes: KonvaDesignNode[];
};

export type KonvaDesignImageNode = {
	kind: 'image';
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	/** 0–1 */
	opacity: number;
	draggable: boolean;
	/** Image URL (https or blob: while valid). */
	src: string;
	/** Optional layer name shown in the layers panel. */
	layerLabel?: string;
	/** Konva visibility; defaults to true when omitted. */
	visible?: boolean;
};

export type KonvaDesignTextNode = {
	kind: 'text';
	id: string;
	x: number;
	y: number;
	width: number;
	rotation: number;
	opacity: number;
	draggable: boolean;
	text: string;
	fontSize: number;
	fontFamily: string;
	fill: string;
	fontStyle: string;
	layerLabel?: string;
	visible?: boolean;
};

/** Freehand stroke from the draw tool (Konva.Line). */
export type KonvaDesignDrawStrokeNode = {
	kind: 'drawStroke';
	id: string;
	points: number[];
	stroke: string;
	strokeWidth: number;
	opacity: number;
	globalCompositeOperation: string;
	layerLabel?: string;
	visible?: boolean;
};

export type KonvaDesignNode = KonvaDesignImageNode | KonvaDesignTextNode | KonvaDesignDrawStrokeNode;
