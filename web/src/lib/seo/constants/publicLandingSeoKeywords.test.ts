import { describe, expect, it } from 'vitest';

import { PUBLIC_LANDING_SEO_KEYWORDS } from '$lib/seo/constants/publicLandingSeoKeywords';

describe('PUBLIC_LANDING_SEO_KEYWORDS', () => {
	it('includes planner-focused schedule and manage terms', () => {
		expect(PUBLIC_LANDING_SEO_KEYWORDS).toEqual(
			expect.arrayContaining([
				'social media',
				'social media schedule',
				'manage social media',
				'schedule social media posts'
			])
		);
	});
});
