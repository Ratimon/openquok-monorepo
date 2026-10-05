import { describe, expect, it } from 'vitest';

import type {
	LinkDirectoryOpportunityDto,
	LinkDirectorySiteDto
} from '$lib/link-directory/link-directory.types';
import { PUBLIC_BUILD_BACKLINKS_HUB } from '$lib/content/constants/hubs/build-backlinks';

import {
	formatBuildBacklinksSiteHeroTitle,
	formatBuildBacklinksSiteMetaDescription,
	formatBuildBacklinksSiteMetaTitle,
	formatBuildBacklinksSiteSeoKeywords,
	summarizePublishedOpportunityDofollow
} from './formatBuildBacklinksSiteSeoCopy';

function makeOpportunity(
	overrides: Partial<LinkDirectoryOpportunityDto> = {}
): LinkDirectoryOpportunityDto {
	return {
		id: 'opp-1',
		siteId: 'site-1',
		slug: 'profile',
		title: 'Profile link',
		opportunityTypeId: 'type-1',
		opportunityType: null,
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
		likes: 0,
		views: 0,
		bookmarkCount: 0,
		averageRating: 0,
		ratingsCount: 0,
		opportunities: [],
		...overrides
	};
}

describe('summarizePublishedOpportunityDofollow', () => {
	it('returns none when no published opportunities exist', () => {
		expect(
			summarizePublishedOpportunityDofollow([
				makeOpportunity({ isAdminPublished: false, dofollow: 'dofollow' })
			])
		).toBe('none');
	});

	it('classifies all-nofollow published opportunities', () => {
		expect(
			summarizePublishedOpportunityDofollow([
				makeOpportunity({ dofollow: 'nofollow' }),
				makeOpportunity({ id: 'opp-2', slug: 'post', dofollow: 'nofollow' })
			])
		).toBe('allNofollow');
	});

	it('classifies all-dofollow published opportunities', () => {
		expect(
			summarizePublishedOpportunityDofollow([
				makeOpportunity({ dofollow: 'dofollow' }),
				makeOpportunity({ id: 'opp-2', slug: 'listing', dofollow: 'dofollow' })
			])
		).toBe('allDofollow');
	});

	it('classifies mixed dofollow treatment', () => {
		expect(
			summarizePublishedOpportunityDofollow([
				makeOpportunity({ dofollow: 'dofollow' }),
				makeOpportunity({ id: 'opp-2', slug: 'post', dofollow: 'nofollow' })
			])
		).toBe('mixed');
	});
});

describe('formatBuildBacklinksSiteMetaTitle', () => {
	it('builds the tools-style SERP title', () => {
		expect(formatBuildBacklinksSiteMetaTitle('Facebook')).toBe(
			'Facebook Backlink Guide — Free Opportunities & Playbook'
		);
	});
});

describe('formatBuildBacklinksSiteHeroTitle', () => {
	it('uses the long-tail H1 pattern with a middle dot', () => {
		expect(formatBuildBacklinksSiteHeroTitle('Facebook')).toBe(
			'Facebook · Free backlink opportunities'
		);
	});
});

describe('formatBuildBacklinksSiteMetaDescription', () => {
	it('uses shortDescription and nofollow notes for Facebook-style sites', () => {
		const description = formatBuildBacklinksSiteMetaDescription(
			makeSite({
				title: 'Facebook',
				shortDescription: 'Pages, profiles, posts, and comments for brand visibility.',
				domainRating: 96,
				opportunities: [
					makeOpportunity({ dofollow: 'nofollow' }),
					makeOpportunity({ id: 'opp-2', slug: 'page-post', dofollow: 'nofollow' })
				]
			})
		);

		expect(description).toContain('Pages, profiles, posts, and comments for brand visibility.');
		expect(description).toContain('nofollow');
		expect(description).not.toContain('dofollow paths');
		expect(description).toContain('DR 96.');
	});

	it('uses dofollow notes for directory sites with only dofollow opportunities', () => {
		const description = formatBuildBacklinksSiteMetaDescription(
			makeSite({
				title: 'Uneed',
				shortDescription: null,
				opportunities: [
					makeOpportunity({ dofollow: 'dofollow' }),
					makeOpportunity({ id: 'opp-2', slug: 'profile', dofollow: 'dofollow' })
				]
			})
		);

		expect(description).toContain('Earn backlinks on Uneed');
		expect(description).toContain('step-by-step playbooks');
		expect(description).toContain('dofollow');
	});

	it('notes mixed link treatment in the fallback template', () => {
		const description = formatBuildBacklinksSiteMetaDescription(
			makeSite({
				title: 'GitHub',
				shortDescription: null,
				opportunities: [
					makeOpportunity({ dofollow: 'dofollow' }),
					makeOpportunity({ id: 'opp-2', slug: 'readme', dofollow: 'nofollow' })
				]
			})
		);

		expect(description).toContain('dofollow or nofollow');
	});
});

describe('formatBuildBacklinksSiteSeoKeywords', () => {
	it('merges hub keywords with site-specific terms without duplicates', () => {
		const keywords = formatBuildBacklinksSiteSeoKeywords(makeSite({ title: 'Facebook' }));

		expect(keywords[0]).toBe(PUBLIC_BUILD_BACKLINKS_HUB.seoKeywords[0]);
		expect(keywords).toContain('Facebook backlinks');
		expect(keywords).toContain('Facebook link building');
		expect(keywords).toContain('free backlink opportunities');
		expect(new Set(keywords.map((k) => k.toLowerCase())).size).toBe(keywords.length);
	});
});
