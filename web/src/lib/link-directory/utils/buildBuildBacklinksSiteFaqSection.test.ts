import { describe, expect, it } from 'vitest';

import type { LinkDirectoryOpportunityDto } from '$lib/link-directory/link-directory.types';

import { buildBuildBacklinksSiteFaqSection } from './buildBuildBacklinksSiteFaqSection';

function makeOpportunity(
	overrides: Partial<LinkDirectoryOpportunityDto> = {}
): LinkDirectoryOpportunityDto {
	return {
		id: 'opp-1',
		siteId: 'site-1',
		slug: 'page-about',
		title: 'Create Facebook Page, then add your backlink',
		opportunityTypeId: 'type-1',
		opportunityType: null,
		effort: 'easy',
		approvalMode: 'instant',
		approvalTimeHint: null,
		dofollow: 'nofollow',
		costTier: 'free',
		costNote: null,
		description: null,
		steps: [],
		openquokCtaKind: 'connect_channel',
		openquokChannelSlug: 'facebook',
		openquokPlugName: null,
		ctaHref: null,
		ctaLabel: null,
		sortOrder: 10,
		isAdminPublished: true,
		publishedAt: null,
		...overrides
	};
}

describe('buildBuildBacklinksSiteFaqSection', () => {
	it('builds site-tailored FAQ for Facebook-style guide', () => {
		const section = buildBuildBacklinksSiteFaqSection({
			canonical: 'https://www.openquok.com/build-backlinks/facebook',
			site: {
				id: 'site-1',
				slug: 'facebook',
				title: 'Facebook',
				siteUrl: 'https://www.facebook.com',
				logoUrl: null,
				shortDescription: null,
				longDescription: null,
				domainAuthority: null,
				domainRating: 96,
				monthlyVisits: 2_800_000_000,
				metricsSource: 'editor_estimate',
				metricsUpdatedAt: '2026-01-15T00:00:00.000Z',
				categoryId: null,
				category: null,
				isOpenquokAuthSupported: true,
				openquokChannelSlug: 'facebook',
				isAdminPublished: true,
				sortOrder: 0,
				tagSlugs: [],
				publishedAt: null,
				opportunities: [
					makeOpportunity({ slug: 'page-about', sortOrder: 10 }),
					makeOpportunity({
						slug: 'page-post',
						title: 'Facebook Page post',
						sortOrder: 20,
						openquokCtaKind: 'schedule_post'
					})
				]
			}
		});

		expect(section.faqTitle).toContain('Facebook');
		expect(section.faqItems.length).toBeGreaterThanOrEqual(5);
		expect(section.faqItems[0].title).toContain('Facebook');
		expect(section.faqItems[0].description).toContain('#howto-page-about');
		expect(section.faqItems[1].description).toContain('nofollow');
		expect(section.faqItems[2].description).toContain('domain rating (DR) 96');
		expect(section.faqItems.some((item) => item.title.includes('OpenQuok'))).toBe(true);
	});

	it('omits OpenQuok FAQ when the site has no supported CTAs', () => {
		const section = buildBuildBacklinksSiteFaqSection({
			canonical: 'https://example.com/build-backlinks/uneed',
			site: {
				id: 'site-2',
				slug: 'uneed',
				title: 'Uneed',
				siteUrl: 'https://uneed.best',
				logoUrl: null,
				shortDescription: null,
				longDescription: null,
				domainAuthority: null,
				domainRating: 42,
				monthlyVisits: 120_000,
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
				opportunities: [
					makeOpportunity({
						openquokCtaKind: 'none',
						dofollow: 'dofollow'
					})
				]
			}
		});

		expect(section.faqItems.some((item) => item.title.includes('OpenQuok'))).toBe(false);
		expect(section.faqItems[1].description).toContain('dofollow');
	});
});
