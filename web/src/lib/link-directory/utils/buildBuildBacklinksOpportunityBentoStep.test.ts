import { describe, expect, it } from 'vitest';

import type { LinkDirectoryOpportunityDto } from '$lib/link-directory/link-directory.types';

import { buildBuildBacklinksOpportunityBentoStep } from './buildBuildBacklinksOpportunityBentoStep';

function makeOpportunity(
	overrides: Partial<LinkDirectoryOpportunityDto> = {}
): LinkDirectoryOpportunityDto {
	return {
		id: 'opp-1',
		siteId: 'site-1',
		slug: 'test',
		title: 'Test opportunity',
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

describe('buildBuildBacklinksOpportunityBentoStep', () => {
	it('maps connect_channel to Safari with external site placeholder', () => {
		const fields = buildBuildBacklinksOpportunityBentoStep(
			makeOpportunity({
				openquokCtaKind: 'connect_channel',
				openquokChannelSlug: 'facebook',
				ctaHref: 'https://www.facebook.com/'
			})
		);
		expect(fields).toMatchObject({
			deviceMock: 'safari',
			deviceMockContent: 'external-site-placeholder',
			mockUrl: 'https://www.facebook.com/'
		});
		expect(fields.animatedContent).toBeUndefined();
	});

	it('maps schedule_post section media to Safari (site or channel path)', () => {
		const fields = buildBuildBacklinksOpportunityBentoStep(
			makeOpportunity({
				openquokCtaKind: 'schedule_post',
				openquokChannelSlug: 'facebook'
			}),
			'https://www.facebook.com'
		);
		expect(fields).toMatchObject({
			deviceMock: 'safari',
			deviceMockContent: 'external-site-placeholder',
			mockUrl: 'https://www.facebook.com'
		});
		expect(fields.channelBentoId).toBeUndefined();
	});

	it('maps schedule_post without siteUrl to Safari with channel marketing path', () => {
		const fields = buildBuildBacklinksOpportunityBentoStep(
			makeOpportunity({ openquokCtaKind: 'schedule_post', openquokChannelSlug: 'bluesky' })
		);
		expect(fields).toMatchObject({
			deviceMock: 'safari',
			mockUrl: '/channels/bluesky'
		});
	});

	it('prefers ctaHref over siteUrl for mockUrl on default CTA kind', () => {
		const fields = buildBuildBacklinksOpportunityBentoStep(
			makeOpportunity({
				openquokCtaKind: 'none',
				ctaHref: 'https://docs.example.com/guide'
			}),
			'https://example.com'
		);
		expect(fields).toMatchObject({
			deviceMock: 'safari',
			deviceMockContent: 'external-site-placeholder',
			mockUrl: 'https://docs.example.com/guide'
		});
	});
});
