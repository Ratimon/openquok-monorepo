import { describe, expect, it } from 'vitest';

import { buildCrossAccountPlugPreviewItems } from '$lib/ui/components/preview/crossAccountPlugPreview';

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
});
