import { describe, expect, it } from 'vitest';

import {
	DEFAULT_TAG_CHIP_COLOR,
	buildTagColorByName,
	calendarChipStatusClasses,
	resolveFirstTagColor,
	tagColorMapsEqual
} from '$lib/posts/utils/tagChipTheme';

describe('buildTagColorByName', () => {
	it('maps tag names to colors with default fallback', () => {
		const map = buildTagColorByName([
			{ name: 'Launch', color: '#ff0000' },
			{ name: 'Evergreen' },
			{ name: '  ', color: '#00ff00' }
		]);

		expect(map.get('Launch')).toBe('#ff0000');
		expect(map.get('Evergreen')).toBe(DEFAULT_TAG_CHIP_COLOR);
		expect(map.has('  ')).toBe(false);
		expect(map.size).toBe(2);
	});

	it('trims tag names before indexing', () => {
		const map = buildTagColorByName([{ name: '  Promo  ', color: '#123456' }]);
		expect(map.get('Promo')).toBe('#123456');
	});
});

describe('tagColorMapsEqual', () => {
	it('returns true for maps with the same entries', () => {
		const a = buildTagColorByName([{ name: 'Launch', color: '#ff0000' }]);
		const b = buildTagColorByName([{ name: 'Launch', color: '#ff0000' }]);
		expect(tagColorMapsEqual(a, b)).toBe(true);
	});

	it('returns false when a color or tag differs', () => {
		const a = buildTagColorByName([{ name: 'Launch', color: '#ff0000' }]);
		const b = buildTagColorByName([{ name: 'Launch', color: '#00ff00' }]);
		const c = buildTagColorByName([{ name: 'Other', color: '#ff0000' }]);
		expect(tagColorMapsEqual(a, b)).toBe(false);
		expect(tagColorMapsEqual(a, c)).toBe(false);
	});
});

describe('resolveFirstTagColor', () => {
	const tagColorByName = buildTagColorByName([
		{ name: 'Launch', color: '#ff0000' },
		{ name: 'Evergreen', color: '#00aa00' }
	]);

	it('uses the first non-empty tag name', () => {
		expect(resolveFirstTagColor(['Launch', 'Evergreen'], tagColorByName)).toEqual({
			color: '#ff0000',
			name: 'Launch'
		});
	});

	it('falls back to default color when tag names are empty', () => {
		expect(resolveFirstTagColor([], tagColorByName)).toEqual({
			color: DEFAULT_TAG_CHIP_COLOR,
			name: null
		});
		expect(resolveFirstTagColor(null, tagColorByName)).toEqual({
			color: DEFAULT_TAG_CHIP_COLOR,
			name: null
		});
	});

	it('falls back to default color for unknown tag names', () => {
		expect(resolveFirstTagColor(['Missing'], tagColorByName)).toEqual({
			color: DEFAULT_TAG_CHIP_COLOR,
			name: 'Missing'
		});
	});

	it('skips blank entries before the first real tag', () => {
		expect(resolveFirstTagColor(['', '  ', 'Evergreen'], tagColorByName)).toEqual({
			color: '#00aa00',
			name: 'Evergreen'
		});
	});
});

describe('calendarChipStatusClasses', () => {
	it('adds a dashed ring for drafts', () => {
		expect(calendarChipStatusClasses('DRAFT')).toEqual({
			chipRing: 'ring-2 ring-dashed ring-base-content/35',
			publishedPill: ''
		});
	});

	it('adds an error ring for failed posts', () => {
		expect(calendarChipStatusClasses('ERROR')).toEqual({
			chipRing: 'ring-2 ring-error',
			publishedPill: ''
		});
		expect(calendarChipStatusClasses('FAILED')).toEqual({
			chipRing: 'ring-2 ring-error',
			publishedPill: ''
		});
	});

	it('adds a published pill without a chip ring', () => {
		const chrome = calendarChipStatusClasses('PUBLISHED');
		expect(chrome.chipRing).toBe('');
		expect(chrome.publishedPill).toContain('bg-success/15');
		expect(chrome.publishedPill).toContain('text-success');
	});

	it('returns no chrome for scheduled states', () => {
		expect(calendarChipStatusClasses('QUEUE')).toEqual({
			chipRing: '',
			publishedPill: ''
		});
		expect(calendarChipStatusClasses('SCHEDULED')).toEqual({
			chipRing: '',
			publishedPill: ''
		});
	});
});
