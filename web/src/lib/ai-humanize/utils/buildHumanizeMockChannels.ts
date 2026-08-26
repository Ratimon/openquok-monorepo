import type { CreateSocialPostChannelViewModel } from '$lib/channels';

import { listPublicChannelsForHub } from '$lib/content/constants/publicChannelConfig';
import { normalizeIntegrationEditorMode } from '$lib/integrations/integrationEditorMode';

export const HUMANIZE_MOCK_CHANNEL_ID_PREFIX = 'humanize-mock-';

export function humanizeMockChannelId(slug: string): string {
	return `${HUMANIZE_MOCK_CHANNEL_ID_PREFIX}${slug.trim().toLowerCase()}`;
}

/**
 * Sample/preview channel chips for the public Humanizer composer.
 * Catalog icons and labels only — not the visitor's workspace accounts, and no OAuth.
 * Includes coming-soon scheduler networks; Humanizer only rewrites text.
 */
export function buildHumanizeMockChannels(): CreateSocialPostChannelViewModel[] {
	return listPublicChannelsForHub().map((channel) => {
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
			postingTimes: [{ time: 540 }],
			editor: normalizeIntegrationEditorMode(channel.slug === 'devto' ? 'markdown' : 'normal')
		};
	});
}
