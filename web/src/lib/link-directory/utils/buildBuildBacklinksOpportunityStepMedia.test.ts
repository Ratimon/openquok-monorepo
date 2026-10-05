import { describe, expect, it } from 'vitest';

import type { LinkDirectoryOpportunityDto } from '$lib/link-directory/link-directory.types';

import {
	buildBuildBacklinksOpportunityStepMedia
} from './buildBuildBacklinksOpportunityBentoStep';

function makeOpportunity(
	overrides: Partial<LinkDirectoryOpportunityDto> = {}
): LinkDirectoryOpportunityDto {
	return {
		id: 'opp-1',
		siteId: 'site-1',
		slug: 'page-post',
		title: 'Facebook Page post',
		opportunityTypeId: 'type-1',
		opportunityType: null,
		effort: 'medium',
		approvalMode: 'instant',
		approvalTimeHint: null,
		dofollow: 'nofollow',
		costTier: 'free',
		costNote: null,
		description: null,
		steps: [],
		openquokCtaKind: 'schedule_post',
		openquokChannelSlug: 'facebook',
		openquokPlugName: null,
		ctaHref: null,
		ctaLabel: null,
		sortOrder: 20,
		isAdminPublished: true,
		publishedAt: null,
		...overrides
	};
}

describe('buildBuildBacklinksOpportunityStepMedia', () => {
	it('uses Safari on step 1 for Facebook schedule_post', () => {
		const media = buildBuildBacklinksOpportunityStepMedia(
			makeOpportunity(),
			1,
			'https://www.facebook.com'
		);
		expect(media).toMatchObject({
			deviceMock: 'safari',
			mockUrl: 'https://www.facebook.com'
		});
		expect(media?.channelBentoId).toBeUndefined();
	});

	it('uses Facebook post editor bento on steps 2 and 3', () => {
		for (const order of [2, 3]) {
			const media = buildBuildBacklinksOpportunityStepMedia(makeOpportunity(), order);
			expect(media).toMatchObject({ channelBentoId: 'facebook-post-editor' });
			expect(media?.deviceMock).toBeUndefined();
		}
	});

	it('returns undefined for non-schedule_post opportunities', () => {
		expect(
			buildBuildBacklinksOpportunityStepMedia(
				makeOpportunity({ openquokCtaKind: 'connect_channel' }),
				1
			)
		).toBeUndefined();
	});
});
