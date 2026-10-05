import { describe, expect, it } from 'vitest';

import type {
	LinkDirectoryOpportunityDto,
	LinkDirectorySiteDto
} from '$lib/link-directory/link-directory.types';

import { createBuildBacklinksItemListSchema } from './createBuildBacklinksSeoSchema';

function makeOpportunity(
	overrides: Partial<LinkDirectoryOpportunityDto> = {}
): LinkDirectoryOpportunityDto {
	return {
		id: 'opp-1',
		siteId: 'site-1',
		slug: 'profile',
		title: 'Profile link',
		opportunityTypeId: 'type-1',
		opportunityType: {
			id: 'type-1',
			slug: 'profile_link',
			label: 'Profile',
			description: null,
			sortOrder: 0
		},
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
		slug: 'github',
		title: 'GitHub',
		siteUrl: 'https://github.com',
		logoUrl: null,
		shortDescription: 'Code hosting',
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
		likes: 0,
		views: 0,
		bookmarkCount: 0,
		averageRating: 0,
		ratingsCount: 0,
		opportunities: [],
		...overrides
	};
}

describe('createBuildBacklinksItemListSchema', () => {
	it('adds metrics PropertyValue and published opportunity hasPart with fragment URLs', () => {
		const schema = createBuildBacklinksItemListSchema({
			canonical: 'https://example.com/build-backlinks',
			origin: 'https://example.com',
			name: 'Build backlinks',
			description: 'Directory',
			sites: [
				makeSite({
					domainRating: 96,
					monthlyVisits: 5000000,
					opportunities: [
						makeOpportunity({
							slug: 'readme',
							title: 'README link',
							sortOrder: 20,
							isAdminPublished: true
						}),
						makeOpportunity({
							slug: 'profile',
							title: 'Profile link',
							sortOrder: 10,
							isAdminPublished: true
						}),
						makeOpportunity({
							slug: 'draft',
							title: 'Unpublished',
							isAdminPublished: false
						})
					]
				})
			]
		});

		const listItem = schema.itemListElement?.[0] as {
			item?: {
				additionalProperty?: Array<{ name?: string; value?: string }>;
				hasPart?: {
					itemListElement?: Array<{ name?: string; url?: string }>;
				};
			};
		};

		const additionalProperty = listItem.item?.additionalProperty ?? [];
		expect(additionalProperty.map((p) => p.name)).toEqual(['domainRating', 'monthlyVisits']);
		expect(additionalProperty[0].value).toBe('96');

		const opportunityItems = listItem.item?.hasPart?.itemListElement ?? [];
		expect(opportunityItems).toHaveLength(2);
		expect(opportunityItems[0].name).toBe('Profile link');
		expect(opportunityItems[0].url).toBe('https://example.com/build-backlinks/github#profile');
		expect(opportunityItems[1].name).toBe('README link');
		expect(opportunityItems[1].url).toBe('https://example.com/build-backlinks/github#readme');
	});

	it('omits additionalProperty and hasPart when metrics and opportunities are empty', () => {
		const schema = createBuildBacklinksItemListSchema({
			canonical: 'https://example.com/build-backlinks',
			origin: 'https://example.com',
			name: 'Build backlinks',
			description: 'Directory',
			sites: [makeSite()]
		});

		const listItem = schema.itemListElement?.[0] as {
			item?: Record<string, unknown>;
		};

		expect(listItem.item?.additionalProperty).toBeUndefined();
		expect(listItem.item?.hasPart).toBeUndefined();
	});
});
