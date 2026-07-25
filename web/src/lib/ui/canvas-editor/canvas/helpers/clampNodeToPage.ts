export type PageInnerBox = { px: number; py: number; pw: number; ph: number };

export type ClientRect = { x: number; y: number; width: number; height: number };

/**
 * Clamp a node's top-left so its client rect stays within the page.
 * Oversized nodes may still slide (same rules as text / draw strokes).
 * Returns the corrected node `x`/`y` (not the client-rect origin).
 */
export function clampNodePositionToPage(
	nodeXY: { x: number; y: number },
	clientRect: ClientRect,
	box: PageInnerBox,
	pad = 4
): { x: number; y: number } {
	const dx = nodeXY.x - clientRect.x;
	const dy = nodeXY.y - clientRect.y;

	const viewW = Math.max(1, box.pw - pad * 2);
	const viewH = Math.max(1, box.ph - pad * 2);

	const minRectX = box.px + pad - Math.max(0, clientRect.width - viewW);
	const maxRectX = box.px + pad + Math.max(0, viewW - clientRect.width);
	const minRectY = box.py + pad - Math.max(0, clientRect.height - viewH);
	const maxRectY = box.py + pad + Math.max(0, viewH - clientRect.height);

	const nxRect = Math.min(Math.max(clientRect.x, minRectX), maxRectX);
	const nyRect = Math.min(Math.max(clientRect.y, minRectY), maxRectY);

	return { x: nxRect + dx, y: nyRect + dy };
}
