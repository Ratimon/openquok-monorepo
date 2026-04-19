/** Serializable design document for the Konva page (export / undo). */
export type KonvaDesignDoc = {
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
};

export type KonvaDesignNode = KonvaDesignImageNode | KonvaDesignTextNode | KonvaDesignDrawStrokeNode;
