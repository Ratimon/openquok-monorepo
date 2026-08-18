import type { CreateSocialPostChannelViewModel } from '$lib/channels';

import { listAvailablePublicChannels } from '$lib/content/constants/publicChannelConfig';

export const HUMANIZE_MOCK_CHANNEL_ID_PREFIX = 'humanize-mock-';

export function humanizeMockChannelId(slug: string): string {
	return `${HUMANIZE_MOCK_CHANNEL_ID_PREFIX}${slug.trim().toLowerCase()}`;
}

/** Fake connected channels for the public Humanizer composer (catalog icons/labels, no OAuth). */
export function buildHumanizeMockChannels(): CreateSocialPostChannelViewModel[] {
	return listAvailablePublicChannels().map((channel) => {
		const id = humanizeMockChannelId(channel.slug);
		return {
			id,
			internalId: `${id}-internal`,
			name: channel.platformLabel,
			identifier: channel.platformId,
			picture: null,
			type: 'social',
			disabled: false,
			inBetweenSteps: false,
			refreshNeeded: false,
			schedulable: true,
			unschedulableReason: null,
			group: null,
			postingTimes: [{ time: 540 }]
		};
	});
}
