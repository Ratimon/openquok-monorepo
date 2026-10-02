import { describe, expect, it } from 'vitest';

import type { LinkDirectoryOpportunityDto } from '$lib/link-directory/link-directory.types';

import {
	createBuildBacklinksOpportunityHowToSchemas,
	createBuildBacklinksSiteGuideHowToSchema
} from './createBuildBacklinksSiteGuideHowToSchema';

function makeOpportunity(
	overrides: Partial<LinkDirectoryOpportunityDto> = {}
): LinkDirectoryOpportunityDto {
	return {
		id: 'opp-1',
		siteId: 'site-1',
		slug: 'page-about',
		title: 'Create Facebook Page with website',
		opportunityTypeId: 'type-1',
		opportunityType: {
			id: 'type-1',
			slug: 'profile_link',
			label: 'Profile link',
			description: null,
			sortOrder: 0
		},
		effort: 'easy',
		approvalMode: 'instant',
		approvalTimeHint: null,
		dofollow: 'nofollow',
		costTier: 'free',
		costNote: null,
		description: 'Add your site under Page About.',
		steps: [
			{ order: 1, title: 'Open About', body: 'Edit website field.' }
		],
		openquokCtaKind: 'connect_channel',
		openquokChannelSlug: 'facebook',
		openquokPlugName: null,
		ctaHref: null,
		ctaLabel: 'Connect Facebook',
		sortOrder: 10,
		isAdminPublished: true,
		publishedAt: null,
		...overrides
	};
}

describe('createBuildBacklinksSiteGuideHowToSchema', () => {
	it('orders opportunities by sortOrder for site-level steps', () => {
		const schema = createBuildBacklinksSiteGuideHowToSchema({
			canonicalUrl: 'https://example.com/build-backlinks/facebook',
			siteTitle: 'Facebook',
			opportunities: [
				makeOpportunity({ slug: 'page-post', title: 'Facebook Page post', sortOrder: 20 }),
				makeOpportunity({ slug: 'page-about', title: 'Create Facebook Page with website', sortOrder: 10 })
			]
		});

		expect(schema['@type']).toBe('HowTo');
		const steps = schema.step as Array<{ name: string; url?: string }>;
		expect(steps[0].name).toBe('Create Facebook Page with website');
		expect(steps[0].url).toContain('#page-about');
		expect(steps[1].name).toBe('Facebook Page post');
	});

	it('emits nested HowTo only when opportunity has sub-steps', () => {
		const nodes = createBuildBacklinksOpportunityHowToSchemas({
			canonicalUrl: 'https://example.com/build-backlinks/facebook',
			opportunities: [
				makeOpportunity({ steps: [] }),
				makeOpportunity({ slug: 'page-about', steps: [{ order: 1, title: 'A', body: 'B' }] })
			]
		});

		expect(nodes).toHaveLength(1);
		expect(nodes[0]['@id']).toContain('#howto-page-about');
	});
});
