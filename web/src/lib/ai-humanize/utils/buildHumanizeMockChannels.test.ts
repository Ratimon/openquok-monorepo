import { describe, expect, it } from 'vitest';

import { listPublicChannelsForHub } from '$lib/content/constants/publicChannelConfig';
import {
	HUMANIZE_MOCK_CHANNEL_ID_PREFIX,
	buildHumanizeMockChannels,
	humanizeMockChannelId
} from '$lib/ai-humanize/utils/buildHumanizeMockChannels';

describe('buildHumanizeMockChannels', () => {
	it('builds one schedulable mock per public catalog channel', () => {
		const catalog = listPublicChannelsForHub();
		const mocks = buildHumanizeMockChannels();

		expect(mocks).toHaveLength(catalog.length);
		expect(mocks.length).toBeGreaterThan(0);
		expect(mocks.some((item) => item.identifier === 'facebook')).toBe(true);
		expect(mocks.some((item) => item.identifier === 'instagram')).toBe(true);
		expect(mocks.some((item) => item.identifier === 'threads')).toBe(true);

		for (const channel of catalog) {
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
