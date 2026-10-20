import { describe, expect, it } from 'vitest';

import { dedupeDirectorySeoHistoryByDay } from '$lib/directory-seo/dedupeDirectorySeoHistoryByDay';

describe('dedupeDirectorySeoHistoryByDay', () => {
	it('keeps the latest sample per UTC day', () => {
		const result = dedupeDirectorySeoHistoryByDay([
			{ capturedAt: '2026-10-20T08:00:00.000Z', domainRating: 10 },
			{ capturedAt: '2026-10-20T12:00:00.000Z', domainRating: 15 },
			{ capturedAt: '2026-10-19T10:00:00.000Z', domainRating: 12 }
		]);
		expect(result).toHaveLength(2);
		expect(result[0]?.domainRating).toBe(12);
		expect(result[1]?.domainRating).toBe(15);
	});
});
