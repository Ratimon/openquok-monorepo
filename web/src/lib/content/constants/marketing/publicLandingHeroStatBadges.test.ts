import { describe, expect, it } from 'vitest';

import { getPublicApiHubLandingHeroStatBadges } from '$lib/content/constants/channels/api/_shared/publicApiCapabilityHubStatBadgesConfig';
import { redditChannel } from '$lib/content/constants/channels/catalog/platforms/reddit';
import { publicLandingHeroStatBadgesFromFeatureSections } from '$lib/content/constants/marketing/publicLandingHeroStatBadges';
import { splitPublicLandingTitleParts } from '$lib/ui/templates/titles/splitPublicLandingTitleParts';
import { PUBLIC_HOME_LANDING_HERO_STAT_BADGES } from '$lib/content/constants/marketing/publicHomeLandingHeroStatBadges';

describe('publicLandingHeroStatBadges', () => {
	it('exposes two product-line cards for the home page', () => {
		expect(PUBLIC_HOME_LANDING_HERO_STAT_BADGES).toHaveLength(2);
		expect(PUBLIC_HOME_LANDING_HERO_STAT_BADGES.map((b) => b.value)).toEqual([
			'Social Scheduler',
			'Auto Submit'
		]);
		expect(PUBLIC_HOME_LANDING_HERO_STAT_BADGES.every((b) => b.href?.startsWith('/'))).toBe(true);
	});

	it('maps feature section subtitles to badge labels', () => {
		const badges = publicLandingHeroStatBadgesFromFeatureSections([
			{ subtitle: 'Node SDK', title: 'TypeScript SDK,for Node.js backends' }
		]);
		expect(badges[0].label).toBe('Node SDK');
		expect(badges[0].value).toContain('TypeScript SDK');
	});

	it('returns four posting API hub badges', () => {
		expect(getPublicApiHubLandingHeroStatBadges('posting')).toHaveLength(4);
	});

	it('reddit feature badge values omit clause commas', () => {
		const badges = publicLandingHeroStatBadgesFromFeatureSections(redditChannel.featureSections);
		expect(badges.map((b) => b.value)).toEqual([
			'Schedule Reddit drafts',
			'Reminded in OpenQuok',
			'Write post as markdown'
		]);
		for (const badge of badges) {
			expect(badge.value).not.toMatch(/,/);
		}
	});

	it('splitPublicLandingTitleParts strips comma clause breaks for badges', () => {
		expect(
			splitPublicLandingTitleParts('Reminded in OpenQuok, you post on reddit.com yourself', true)[0]
		).toBe('Reminded in OpenQuok');
	});
});
