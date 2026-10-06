import { describe, expect, it } from 'vitest';

import { parseOptionalIntFormField, trimFormField } from './trimFormField';

describe('trimFormField', () => {
	it('trims strings', () => {
		expect(trimFormField('  hi  ')).toBe('hi');
	});

	it('coerces numbers from type=number inputs', () => {
		expect(trimFormField(42)).toBe('42');
		expect(parseOptionalIntFormField(42)).toBe(42);
	});

	it('returns empty for nullish', () => {
		expect(trimFormField(null)).toBe('');
		expect(parseOptionalIntFormField(undefined)).toBeNull();
	});
});
