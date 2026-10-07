import { describe, expect, it } from 'vitest';

import {
	formatMonthlyVisitsEditorDisplay,
	formatMonthlyVisitsEditorExactHint,
	parseMonthlyVisitsFormField
} from './monthlyVisitsFormField';

describe('parseMonthlyVisitsFormField', () => {
	it('parses comma-separated integers', () => {
		expect(parseMonthlyVisitsFormField('1,210,000,000')).toBe(1_210_000_000);
		expect(parseMonthlyVisitsFormField('520,000,000')).toBe(520_000_000);
	});

	it('parses plain digits', () => {
		expect(parseMonthlyVisitsFormField('520000000')).toBe(520_000_000);
	});

	it('parses billion and million shorthand', () => {
		expect(parseMonthlyVisitsFormField('1.21 billion')).toBe(1_210_000_000);
		expect(parseMonthlyVisitsFormField('.21 billion')).toBe(210_000_000);
		expect(parseMonthlyVisitsFormField('0.52B')).toBe(520_000_000);
		expect(parseMonthlyVisitsFormField('520M')).toBe(520_000_000);
		expect(parseMonthlyVisitsFormField('120 thousand')).toBe(120_000);
	});

	it('returns null for empty or invalid', () => {
		expect(parseMonthlyVisitsFormField('')).toBeNull();
		expect(parseMonthlyVisitsFormField('  ')).toBeNull();
		expect(parseMonthlyVisitsFormField('lots of traffic')).toBeNull();
	});
});

describe('formatMonthlyVisitsEditorDisplay', () => {
	it('formats large counts with unit words', () => {
		expect(formatMonthlyVisitsEditorDisplay(1_210_000_000)).toBe('1.21 billion');
		expect(formatMonthlyVisitsEditorDisplay(520_000_000)).toBe('520 million');
		expect(formatMonthlyVisitsEditorDisplay(120_000)).toBe('120 thousand');
	});

	it('formats small counts with locale grouping', () => {
		expect(formatMonthlyVisitsEditorDisplay(800)).toBe('800');
	});
});

describe('formatMonthlyVisitsEditorExactHint', () => {
	it('shows grouped integer hint', () => {
		expect(formatMonthlyVisitsEditorExactHint(520_000_000)).toBe('520,000,000 visits/month');
	});
});
