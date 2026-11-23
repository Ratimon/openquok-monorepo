import { describe, expect, it } from 'vitest';

import { formatBuildBacklinksHubHeroDescription } from './buildBuildBacklinksHubStats';

describe('formatBuildBacklinksHubHeroDescription', () => {
	it('includes formatted counts in the hero copy', () => {
		const description = formatBuildBacklinksHubHeroDescription({
			sites: 42,
			opportunities: 120,
			freeOrFreemium: 95,
			quickWins: 18,
			categories: 6
		});

		expect(description).toContain('42 platforms');
		expect(description).toContain('120 link-building opportunities');
		expect(description).toContain('95 paths are free or freemium');
		expect(description).toContain('18 are quick wins');
	});
});
