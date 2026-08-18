import { describe, expect, it } from 'vitest';

import { listAvailablePublicChannels } from '$lib/content/constants/publicChannelConfig';
import {
	HUMANIZE_MOCK_CHANNEL_ID_PREFIX,
	buildHumanizeMockChannels,
	humanizeMockChannelId
} from '$lib/ai-humanize/utils/buildHumanizeMockChannels';

describe('buildHumanizeMockChannels', () => {
	it('builds one schedulable mock per live public channel', () => {
		const live = listAvailablePublicChannels();
		const mocks = buildHumanizeMockChannels();

		expect(mocks).toHaveLength(live.length);
		expect(mocks.length).toBeGreaterThan(0);

		for (const channel of live) {
			const mock = mocks.find((item) => item.identifier === channel.platformId);
			expect(mock).toBeDefined();
			expect(mock?.id).toBe(humanizeMockChannelId(channel.slug));
			expect(mock?.id.startsWith(HUMANIZE_MOCK_CHANNEL_ID_PREFIX)).toBe(true);
			expect(mock?.name).toBe(channel.platformLabel);
			expect(mock?.schedulable).toBe(true);
			expect(mock?.type).toBe('social');
			expect(mock?.group).toBeNull();
		}
	});
});
