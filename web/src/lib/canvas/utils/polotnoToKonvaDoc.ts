/**
 * Best-effort import of Polotno design JSON into our Konva snapshot format (text + images on page 1).
 */
import { nanoid } from 'nanoid';

import type { PageInnerBox } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
import type {
	KonvaDesignDoc,
	KonvaDesignImageNode,
	KonvaDesignNode,
	KonvaDesignTextNode
} from '$lib/ui/canvas-editor/utils/canvasDoc';

type PolotnoChild = {
	id?: string;
	type?: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	rotation?: number;
	opacity?: number;
	visible?: boolean;
	locked?: boolean;
	selectable?: boolean;
	text?: string;
	fontSize?: number;
	fontFamily?: string;
	fontStyle?: string;
	fontWeight?: string;
	fill?: string;
	src?: string;
	children?: PolotnoChild[];
};

type PolotnoPage = {
	background?: unknown;
	children?: PolotnoChild[];
};

type PolotnoRoot = {
	width?: number;
	height?: number;
	pages?: PolotnoPage[];
};

function toKonvaFontStyle(node: PolotnoChild): string {
	const italic = node.fontStyle === 'italic';
	const weight = node.fontWeight;
	const bold = weight === 'bold' || weight === '700';
	if (italic && bold) return 'italic bold';
	if (italic) return 'italic';
	if (bold) return 'bold';
	return 'normal';
}

function pageFillFromPolotno(bg: unknown): string {
	if (typeof bg === 'string' && bg.trim()) return bg;
	return '#ffffff';
}

function collectVisibleChildren(
	children: PolotnoChild[] | undefined,
	originX: number,
	originY: number,
	out: PolotnoChild[]
) {
	if (!children?.length) return;
	for (const c of children) {
		if (c.visible === false) continue;
		const lx = (c.x ?? 0) + originX;
		const ly = (c.y ?? 0) + originY;
		if (c.type === 'group' && c.children?.length) {
			collectVisibleChildren(c.children, lx, ly, out);
			continue;
		}
		out.push({ ...c, x: lx, y: ly });
	}
}

/**
 * Maps Polotno canvas coordinates into the current stage page rect using uniform scale + letterboxing.
 */
export function polotnoJsonToKonvaDoc(json: unknown, box: PageInnerBox): KonvaDesignDoc {
	const root = json as PolotnoRoot;
	const tw = root.width ?? 1080;
	const th = root.height ?? 1080;
	const page0 = root.pages?.[0] as PolotnoPage | undefined;
	if (!page0) {
		return { pageFill: '#ffffff', nodes: [] };
	}

	const flat: PolotnoChild[] = [];
	collectVisibleChildren(page0.children, 0, 0, flat);

	const s = Math.min(box.pw / tw, box.ph / th);
	const offsetX = box.px + (box.pw - tw * s) / 2;
	const offsetY = box.py + (box.ph - th * s) / 2;

	const nodes: KonvaDesignNode[] = [];

	for (const el of flat) {
		if (el.type === 'text') {
			const t = el as PolotnoChild;
			const text = typeof t.text === 'string' ? t.text : '';
			const width = Math.max(8, (t.width ?? 100) * s);
			const n: KonvaDesignTextNode = {
				kind: 'text',
				id: t.id && String(t.id).length ? String(t.id) : nanoid(10),
				x: offsetX + (t.x ?? 0) * s,
				y: offsetY + (t.y ?? 0) * s,
				width,
				rotation: t.rotation ?? 0,
				opacity: typeof t.opacity === 'number' ? t.opacity : 1,
				draggable: t.locked !== true,
				text,
				fontSize: Math.max(4, (t.fontSize ?? 16) * s),
				fontFamily: t.fontFamily || 'Roboto, system-ui, sans-serif',
				fill: typeof t.fill === 'string' ? t.fill : '#0f172a',
				fontStyle: toKonvaFontStyle(t)
			};
			nodes.push(n);
		} else if (el.type === 'image' && typeof el.src === 'string' && el.src) {
			const im = el as PolotnoChild;
			const src = el.src;
			const n: KonvaDesignImageNode = {
				kind: 'image',
				id: im.id && String(im.id).length ? String(im.id) : nanoid(10),
				x: offsetX + (im.x ?? 0) * s,
				y: offsetY + (im.y ?? 0) * s,
				width: Math.max(4, (im.width ?? 100) * s),
				height: Math.max(4, (im.height ?? 100) * s),
				rotation: im.rotation ?? 0,
				opacity: typeof im.opacity === 'number' ? im.opacity : 1,
				draggable: im.locked !== true,
				src
			};
			nodes.push(n);
		}
	}

	return {
		pageFill: pageFillFromPolotno(page0.background),
		nodes
	};
}

/**
 * Polotno text-template placement for the side-panel text picker (uniform scale from page diagonal / 2160,
 * anchored at drop point or page center). Differs from {@link polotnoJsonToKonvaDoc} which letterboxes the full design.
 */
export function polotnoTextTemplateJsonToKonvaDoc(
	json: unknown,
	box: PageInnerBox,
	opts?: { dropX?: number; dropY?: number }
): KonvaDesignDoc {
	const root = json as PolotnoRoot;
	const tw = root.width ?? 1080;
	const th = root.height ?? 1080;
	const page0 = root.pages?.[0] as PolotnoPage | undefined;
	if (!page0) {
		return { pageFill: '#ffffff', nodes: [] };
	}

	const flat: PolotnoChild[] = [];
	collectVisibleChildren(page0.children, 0, 0, flat);

	const scale = (box.pw + box.ph) / 2160;
	const baseX =
		opts?.dropX != null
			? opts.dropX - (tw / 2) * scale
			: box.px + box.pw / 2 - (tw / 2) * scale;
	const baseY =
		opts?.dropY != null
			? opts.dropY - (th / 2) * scale
			: box.py + box.ph / 2 - (th / 2) * scale;

	const nodes: KonvaDesignNode[] = [];

	for (const el of flat) {
		if (el.type === 'text') {
			const t = el as PolotnoChild;
			const text = typeof t.text === 'string' ? t.text : '';
			const width = Math.max(8, (t.width ?? 100) * scale);
			const n: KonvaDesignTextNode = {
				kind: 'text',
				id: nanoid(10),
				x: baseX + (t.x ?? 0) * scale,
				y: baseY + (t.y ?? 0) * scale,
				width,
				rotation: t.rotation ?? 0,
				opacity: typeof t.opacity === 'number' ? t.opacity : 1,
				draggable: t.locked !== true,
				text,
				fontSize: Math.max(4, (t.fontSize ?? 16) * scale),
				fontFamily: t.fontFamily || 'Roboto, system-ui, sans-serif',
				fill: typeof t.fill === 'string' ? t.fill : '#0f172a',
				fontStyle: toKonvaFontStyle(t)
			};
			nodes.push(n);
		} else if (el.type === 'image' && typeof el.src === 'string' && el.src) {
			const im = el as PolotnoChild;
			const src = el.src;
			const n: KonvaDesignImageNode = {
				kind: 'image',
				id: nanoid(10),
				x: baseX + (im.x ?? 0) * scale,
				y: baseY + (im.y ?? 0) * scale,
				width: Math.max(4, (im.width ?? 100) * scale),
				height: Math.max(4, (im.height ?? 100) * scale),
				rotation: im.rotation ?? 0,
				opacity: typeof im.opacity === 'number' ? im.opacity : 1,
				draggable: im.locked !== true,
				src
			};
			nodes.push(n);
		}
	}

	return {
		pageFill: pageFillFromPolotno(page0.background),
		nodes
	};
}
