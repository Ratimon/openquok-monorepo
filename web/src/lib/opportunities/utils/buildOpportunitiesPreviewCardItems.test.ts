import { describe, expect, it } from 'vitest';

import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';

import {
	buildBacklinksPreviewCardItems,
	mergeFeaturedBacklinkSitesForPreview
} from '$lib/opportunities/utils/buildOpportunitiesPreviewCardItems';
import type { LinkDirectoryOpportunityDto } from '$lib/link-directory/link-directory.types';

function site(id: string, slug: string): LinkDirectorySiteDto {
	return {
		id,
		slug,
		title: slug,
		siteUrl: `https://example.com/${slug}`,
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
		likes: 0,
		views: 0,
		bookmarkCount: 0,
		averageRating: 0,
		ratingsCount: 0,
		opportunities: []
	};
}

function opportunity(
	id: string,
	slug: string,
	title: string,
	sortOrder: number
): LinkDirectoryOpportunityDto {
	return {
		id,
		siteId: 'site',
		slug,
		title,
		opportunityTypeId: 'type',
		opportunityType: null,
		effort: 'easy',
		approvalMode: 'instant',
		approvalTimeHint: null,
		dofollow: 'unknown',
		costTier: 'free',
		costNote: null,
		description: `${title} description`,
		steps: [],
		openquokCtaKind: 'none',
		openquokChannelSlug: null,
		openquokPlugName: null,
		ctaHref: null,
		ctaLabel: null,
		sortOrder,
		isAdminPublished: true,
		publishedAt: null
	};
}

describe('buildBacklinksPreviewCardItems', () => {
	it('shows only HowTo opportunity deep links when featured opportunity limit is set', () => {
		const featured = {
			...site('fb', 'facebook'),
			opportunities: [
				opportunity('o1', 'page-about-link', 'Create Facebook Page with website', 10),
				opportunity('o2', 'page-post', 'Facebook Page post', 20)
			]
		};

		const items = buildBacklinksPreviewCardItems({
			featuredSite: featured,
			taggedSites: [],
			limit: 6,
			featuredOpportunityLimit: 2
		});

		expect(items.map((item) => item.href)).toEqual([
			'/build-backlinks/facebook#howto-page-about-link',
			'/build-backlinks/facebook#howto-page-post'
		]);
		expect(items).toHaveLength(2);
	});
});

describe('mergeFeaturedBacklinkSitesForPreview', () => {
	it('pins featured site first and dedupes tag-filter results', () => {
		const featured = site('fb', 'facebook');
		const fromTags = [site('fb', 'facebook'), site('x', 'x')];

		const merged = mergeFeaturedBacklinkSitesForPreview(featured, fromTags, 6);

		expect(merged.map((s) => s.slug)).toEqual(['facebook', 'x']);
	});

	it('returns tag-filter only when featured is null', () => {
		const fromTags = [site('a', 'a'), site('b', 'b')];
		expect(mergeFeaturedBacklinkSitesForPreview(null, fromTags, 1).map((s) => s.slug)).toEqual(['a']);
	});

	it('reserves one slot for featured when applying limit', () => {
		const featured = site('fb', 'facebook');
		const fromTags = [site('a', 'a'), site('b', 'b'), site('c', 'c')];

		const merged = mergeFeaturedBacklinkSitesForPreview(featured, fromTags, 2);

		expect(merged.map((s) => s.slug)).toEqual(['facebook', 'a']);
	});
});
