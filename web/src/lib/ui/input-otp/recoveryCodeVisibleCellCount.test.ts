import { describe, expect, it } from 'vitest';

import { recoveryCodeVisibleCellCount } from './recoveryCodeVisibleCellCount';

describe('recoveryCodeVisibleCellCount', () => {
	it('shows 6 cells until the user reaches 6 digits', () => {
		expect(recoveryCodeVisibleCellCount(0, 6, 8)).toBe(6);
		expect(recoveryCodeVisibleCellCount(5, 6, 8)).toBe(6);
	});

	it('expands to 8 cells at 6+ digits', () => {
		expect(recoveryCodeVisibleCellCount(6, 6, 8)).toBe(8);
		expect(recoveryCodeVisibleCellCount(7, 6, 8)).toBe(8);
		expect(recoveryCodeVisibleCellCount(8, 6, 8)).toBe(8);
	});
});
