import { describe, expect, it } from 'vitest';

import type {
	LinkDirectoryOpportunityDto,
	LinkDirectorySiteDto,
	LinkDirectoryTagDto
} from '$lib/link-directory/link-directory.types';

import { buildBuildBacklinksTagOverview } from './buildBuildBacklinksOverviewCounts';

function makeOpportunity(
	overrides: Partial<LinkDirectoryOpportunityDto> = {}
): LinkDirectoryOpportunityDto {
	return {
		id: 'opp-1',
		siteId: 'site-1',
		slug: 'profile',
		title: 'Profile',
		opportunityTypeId: 'type-1',
		opportunityType: { id: 'type-1', slug: 'profile_link', label: 'Profile', description: null, sortOrder: 0 },
		effort: 'easy',
		approvalMode: 'instant',
		approvalTimeHint: null,
		dofollow: 'dofollow',
		costTier: 'free',
		costNote: null,
		description: null,
		steps: [],
		openquokCtaKind: 'none',
		openquokChannelSlug: null,
		openquokPlugName: null,
		ctaHref: null,
		ctaLabel: null,
		sortOrder: 0,
		isAdminPublished: true,
		publishedAt: null,
		...overrides
	};
}

function makeSite(overrides: Partial<LinkDirectorySiteDto> = {}): LinkDirectorySiteDto {
	return {
		id: 'site-1',
		slug: 'example',
		title: 'Example',
		siteUrl: 'https://example.com',
		logoUrl: null,
		shortDescription: null,
		longDescription: null,
		domainAuthority: null,
		domainRating: null,
		monthlyVisits: null,
		metricsSource: null,
		metricsUpdatedAt: null,
		categoryId: null,
		category: null,
		isOpenquokAuthSupported: false,
		openquokChannelSlug: null,
		isAdminPublished: true,
		sortOrder: 0,
		tagSlugs: [],
		publishedAt: null,
		opportunities: [makeOpportunity()],
		...overrides
	};
}

const editorialTag: LinkDirectoryTagDto = {
	id: 'tag-1',
	name: 'High DR',
	slug: 'high-dr',
	headline: null,
	description: null,
	groups: [{ id: 'g-1', name: 'Quality', sortOrder: 0 }]
};

describe('buildBuildBacklinksTagOverview', () => {
	it('includes editorial tags from API and ignores legacy facet slugs on sites', () => {
		const sites = [makeSite({ tagSlugs: ['high-dr', 'dofollow'] })];
		const overview = buildBuildBacklinksTagOverview([editorialTag], sites);

		const highDr = overview.find((item) => item.slug === 'high-dr');
		expect(highDr?.count).toBe(1);
		expect(overview.some((item) => item.slug === 'dofollow' && item.groupName === 'Quality')).toBe(
			false
		);
	});

	it('counts virtual dofollow from opportunities', () => {
		const sites = [
			makeSite({ opportunities: [makeOpportunity({ dofollow: 'dofollow' })] }),
			makeSite({
				id: 'site-2',
				slug: 'other',
				opportunities: [makeOpportunity({ dofollow: 'nofollow' })]
			})
		];
		const overview = buildBuildBacklinksTagOverview([editorialTag], sites);
		const dofollow = overview.find((item) => item.slug === 'dofollow');

		expect(dofollow?.count).toBe(1);
		expect(dofollow?.groupName).toBe('Opportunity filters');
	});
});
