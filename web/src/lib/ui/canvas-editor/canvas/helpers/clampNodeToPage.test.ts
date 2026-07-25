import { describe, expect, it } from 'vitest';

import { clampNodePositionToPage } from './clampNodeToPage';

const page = { px: 100, py: 50, pw: 400, ph: 400 };

describe('clampNodePositionToPage', () => {
	it('keeps a small node inside the page', () => {
		const pos = clampNodePositionToPage(
			{ x: 50, y: 20 },
			{ x: 50, y: 20, width: 80, height: 80 },
			page
		);
		expect(pos).toEqual({ x: 104, y: 54 });
	});

	it('allows sliding when the visual rect is larger than the page', () => {
		// Node was resized via Transformer scale: logical width still 500, but
		// client rect is the visual 500×500 — still oversized.
		const pos = clampNodePositionToPage(
			{ x: 200, y: 100 },
			{ x: 200, y: 100, width: 500, height: 500 },
			page
		);
		// max slide: left edge can go to px+pad-(width-viewW) = 100+4-(500-392)= -4
		// right edge: px+pad = 104
		expect(pos.x).toBe(104);
		expect(pos.y).toBe(54);
	});

	it('does not snap an oversized node to a single invalid point when max < min', () => {
		// Old image clamp used width() without scale and forced maxX when maxX < minX.
		// Sliding within the allowed range must still move when the user drags.
		const left = clampNodePositionToPage(
			{ x: -50, y: 54 },
			{ x: -50, y: 54, width: 500, height: 80 },
			page
		);
		const right = clampNodePositionToPage(
			{ x: 300, y: 54 },
			{ x: 300, y: 54, width: 500, height: 80 },
			page
		);
		expect(left.x).toBeLessThan(right.x);
	});

	it('accounts for offset between node x/y and client rect (rotation / scale)', () => {
		const pos = clampNodePositionToPage(
			{ x: 150, y: 80 },
			{ x: 140, y: 70, width: 80, height: 80 },
			page
		);
		// client rect already in bounds → node x/y unchanged
		expect(pos).toEqual({ x: 150, y: 80 });
	});
});
