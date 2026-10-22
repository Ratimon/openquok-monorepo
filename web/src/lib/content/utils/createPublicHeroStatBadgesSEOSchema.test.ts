import { describe, expect, it } from 'vitest';

import {
	createPublicHeroStatBadgesSEOSchema,
	PUBLIC_LANDING_HERO_STAT_BADGES_SECTION_ID
} from '$lib/content/utils/createPublicHeroStatBadgesSEOSchema';

const SAMPLE_BADGES = [
	{ id: 'pick-directories', value: 'Your picks', label: 'Curated catalog' },
	{
		id: 'social-scheduler',
		value: 'Social Scheduler',
		label: 'Plan and publish',
		href: '/social-media-management'
	}
] as const;

describe('createPublicHeroStatBadgesSEOSchema', () => {
	it('uses a stable section fragment id', () => {
		expect(PUBLIC_LANDING_HERO_STAT_BADGES_SECTION_ID).toBe('product-highlights');
	});

	it('emits ItemList section schema for hero stat badges', () => {
		const node = createPublicHeroStatBadgesSEOSchema({
			pageUrl: 'https://www.openquok.com/directory-submission-tool',
			pageOrigin: 'https://www.openquok.com',
			sectionName: 'Directory submission highlights',
			badges: SAMPLE_BADGES
		});

		expect(node).toMatchObject({
			'@type': 'ItemList',
			'@id': 'https://www.openquok.com/directory-submission-tool#product-highlights',
			name: 'Directory submission highlights',
			numberOfItems: 2
		});

		const elements = (node as { itemListElement: unknown[] }).itemListElement;
		expect(elements[0]).toMatchObject({
			'@type': 'ListItem',
			position: 1,
			item: {
				'@type': 'Thing',
				'@id':
					'https://www.openquok.com/directory-submission-tool#product-highlights-pick-directories',
				name: 'Your picks',
				description: 'Curated catalog'
			}
		});
		expect(elements[1]).toMatchObject({
			item: {
				url: 'https://www.openquok.com/social-media-management'
			}
		});
	});

	it('returns null when badges are missing', () => {
		expect(
			createPublicHeroStatBadgesSEOSchema({
				pageUrl: 'https://example.com',
				badges: []
			})
		).toBeNull();
	});
});
