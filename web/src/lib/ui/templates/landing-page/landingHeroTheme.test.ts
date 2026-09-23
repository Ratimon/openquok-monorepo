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

describe('landingHeroTheme feature-row title clauses', () => {
	function highlightedTextsInClause(clause: string): string[] {
		return landingHeroTheme
			.parseLandingHeroTitlePartSegments(clause)
			.filter((segment) => segment.highlight)
			.map((segment) => segment.text.toLowerCase());
	}

	it('chips track and winners in channel insights middle and closing clauses', () => {
		const facebookTitle =
			'See what resonates on your Page, track impressions and clicks, double down on winners';
		const [, trackClause, winnersClause] = facebookTitle.split(',').map((part) => part.trim());

		expect(highlightedTextsInClause(trackClause)).toContain('track');
		expect(highlightedTextsInClause(winnersClause)).toContain('winners');
	});

	it('chips track in TikTok insights middle clause', () => {
		const tiktokTitle =
			'See what resonates on TikTok, track followers and engagement, and iterate';
		const [, trackClause] = tiktokTitle.split(',').map((part) => part.trim());

		expect(highlightedTextsInClause(trackClause)).toContain('track');
	});

	it('chips winners in agent feature analytics clause', () => {
		const grokTitle = 'Ask what worked, see winners, and adapt from chat';
		const [, winnersClause] = grokTitle.split(',').map((part) => part.trim());

		expect(highlightedTextsInClause(winnersClause)).toContain('winners');
	});

	it('assigns per-clause gradient classes for three-part feature titles', () => {
		expect(landingHeroTheme.titlePartClass(0, 3)).toBe('text-base-content');
		expect(landingHeroTheme.titlePartClass(1, 3)).toContain('bg-gradient-to-r');
		expect(landingHeroTheme.titlePartClass(2, 3)).toContain('from-fuchsia-300');
	});

	it('chips approve and hermes on agent hero single-line titles', () => {
		const heroTitle = 'Schedule social media from Hermes then you approve';
		const highlights = highlightedTextsInClause(heroTitle);

		expect(highlights).toContain('hermes');
		expect(highlights).toContain('approve');
	});
});
