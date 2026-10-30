import { describe, expect, it } from 'vitest';

import { formatSocialConnectionLabel } from './dashboardConnectionLabel.js';

describe('formatSocialConnectionLabel', () => {
	it('labels production cloud', () => {
		expect(formatSocialConnectionLabel('https://www.openquok.com')).toBe(
			'Connected to OpenQuok.com (Cloud)'
		);
	});

	it('labels local self host', () => {
		expect(formatSocialConnectionLabel('https://localhost:5173')).toBe(
			'Connected to https://localhost:5173 (Self host)'
		);
	});
});
