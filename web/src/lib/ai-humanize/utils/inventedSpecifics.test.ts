import { describe, expect, it } from 'vitest';

import { findInventedSpecifics } from '$lib/ai-humanize/utils/inventedSpecifics';

describe('findInventedSpecifics', () => {
	it('flags prices, dates, and names that were not in the source', () => {
		const source = 'We shipped the billing fix this morning.';
		const rewritten = 'Jordan Hale billed $49 on March 12.';
		const notes = findInventedSpecifics(source, rewritten);

		expect(notes.map((note) => note.kind).sort()).toEqual(['date', 'name', 'price']);
		expect(notes.some((note) => note.value.includes('49'))).toBe(true);
		expect(notes.some((note) => note.value.includes('March'))).toBe(true);
		expect(notes.some((note) => note.value === 'Jordan Hale')).toBe(true);
	});

	it('does not flag specifics that already appear in the source', () => {
		const source = 'Jordan Hale billed $49 on March 12.';
		const rewritten = 'Jordan Hale billed $49 on March 12, as planned.';
		expect(findInventedSpecifics(source, rewritten)).toEqual([]);
	});

	it('returns nothing when the rewrite is empty', () => {
		expect(findInventedSpecifics('We shipped.', '')).toEqual([]);
	});
});
