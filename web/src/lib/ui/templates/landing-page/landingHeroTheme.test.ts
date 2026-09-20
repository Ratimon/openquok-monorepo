import { describe, expect, it } from 'vitest';

import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

describe('landingHeroTheme hub title segments', () => {
	it('gradients the lead clause and chips only the API suffix on hub heroes', () => {
		for (const title of ['Social Media Posting API', 'Social Media Scheduling API']) {
			const segments = landingHeroTheme.parseLandingHeroTitlePartSegments(title);
			expect(segments.length).toBeGreaterThan(1);
			expect(segments.some((segment) => segment.highlight)).toBe(true);
			expect(segments.some((segment) => !segment.highlight)).toBe(true);
			expect(segments.every((segment) => segment.highlight)).toBe(false);
		}
	});
});
