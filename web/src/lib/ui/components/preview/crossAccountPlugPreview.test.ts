import { describe, expect, it } from 'vitest';

import {
	buildCrossAccountPlugPreviewItems,
	buildCrossAccountPlugPreviewFromProviderSettings,
	formatLinkedInEngagementSummary,
	summarizeScheduledSocialPreviewEngagement
} from '$lib/ui/components/preview/crossAccountPlugPreview';

describe('buildCrossAccountPlugPreviewItems', () => {
	it('maps enabled comment plugs to acting channel preview rows', () => {
		const items = buildCrossAccountPlugPreviewItems(
			[
				{
					id: 'publisher',
					internalId: 'publisher-internal',
					name: 'OpenQuok Brand',
					identifier: 'threads',
					picture: '/icon.svg',
					type: 'social',
					disabled: false,
					inBetweenSteps: false,
					refreshNeeded: false,
					schedulable: true,
					unschedulableReason: null,
					group: null,
					postingTimes: [{ time: 540 }],
					editor: 'normal'
				},
				{
					id: 'brand',
					internalId: 'brand-internal',
					name: 'OpenQuok',
					identifier: 'threads',
					picture: '/landing/social-profile.webp',
					type: 'social',
					disabled: false,
					inBetweenSteps: false,
					refreshNeeded: false,
					schedulable: true,
					unschedulableReason: null,
					group: null,
					postingTimes: [{ time: 540 }],
					editor: 'normal'
				}
			],
			[
				{
					plugName: 'threads-cross-account-comment',
					enabled: true,
					delayMs: 120_000,
					integrationIds: ['brand'],
					fields: { comment: 'More at www.openquok.com' }
				}
			],
			[{ identifier: 'threads-cross-account-comment', title: 'Add comments by other accounts' }]
		);

		expect(items).toHaveLength(1);
		expect(items[0]).toMatchObject({
			kind: 'comment',
			actorName: 'OpenQuok',
			actorPicture: '/landing/social-profile.webp',
			message: 'More at www.openquok.com'
		});
	});

	it('uses a fallback actor label when the acting channel is not in the list', () => {
		const items = buildCrossAccountPlugPreviewItems(
			[],
			[
				{
					plugName: 'linkedin-cross-account-comment',
					enabled: true,
					delayMs: 0,
					integrationIds: ['missing-id'],
					fields: { comment: 'Company follow-up' }
				}
			]
		);

		expect(items).toHaveLength(1);
		expect(items[0]).toMatchObject({
			kind: 'comment',
			actorName: 'Connected channel',
			message: 'Company follow-up'
		});
	});
});

describe('summarizeScheduledSocialPreviewEngagement', () => {
	it('counts thread replies, finisher, delayed engagement, and cross-account comments', () => {
		const engagement = summarizeScheduledSocialPreviewEngagement({
			threadReplyCount: 2,
			threadFinisher: { enabled: true, message: 'Closing line' },
			delayedEngagementReply: { message: 'Delayed plug', delaySeconds: 60 },
			crossAccountPlugs: [
				{
					id: 'a',
					kind: 'comment',
					actorName: 'Brand',
					actorPicture: null,
					message: 'Hi',
					delayMs: 0,
					label: 'Comment'
				},
				{
					id: 'b',
					kind: 'repost',
					actorName: 'Other',
					actorPicture: null,
					message: '',
					delayMs: 0,
					label: 'Repost'
				}
			]
		});

		expect(engagement).toEqual({
			commentCount: 1,
			repostCount: 1,
			totalCommentCount: 5
		});
	});
});

describe('formatLinkedInEngagementSummary', () => {
	it('builds a comments and reposts line from scheduled preview engagement', () => {
		expect(
			formatLinkedInEngagementSummary({
				totalCommentCount: 1,
				repostCount: 2
			})
		).toBe('1 comment · 2 reposts');
	});

	it('returns null when there is nothing scheduled', () => {
		expect(formatLinkedInEngagementSummary({ totalCommentCount: 0, repostCount: 0 })).toBeNull();
	});
});

describe('buildCrossAccountPlugPreviewFromProviderSettings', () => {
	it('reads cross-account plugs from the matching provider settings bucket', () => {
		const items = buildCrossAccountPlugPreviewFromProviderSettings({
			channelIdentifier: 'threads',
			channels: [
				{
					id: 'brand',
					internalId: 'brand-internal',
					name: 'OpenQuok',
					identifier: 'threads',
					picture: null,
					type: 'social',
					disabled: false,
					inBetweenSteps: false,
					refreshNeeded: false,
					schedulable: true,
					unschedulableReason: null,
					group: null,
					postingTimes: [{ time: 540 }],
					editor: 'normal'
				}
			],
			providerSettings: {
				threads: {
					crossAccountPlugs: [
						{
							plugName: 'threads-cross-account-comment',
							enabled: true,
							delayMs: 0,
							integrationIds: ['brand'],
							fields: { comment: 'Follow-up' }
						}
					]
				}
			}
		});

		expect(items).toHaveLength(1);
		expect(items[0].message).toBe('Follow-up');
	});
});
