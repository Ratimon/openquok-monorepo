import { describe, expect, it } from 'vitest';

import {
	getHumanizeChannelBySlug,
	listHumanizeChannelsForHub,
	PUBLIC_HUMANIZE_GENERIC_CONFIG
} from '$lib/ai-humanize/constants/publicHumanizeChannelConfig';
import { getRootPathPublicHumanizeChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import {
	listAvailablePublicChannels,
	listPublicChannelsForHub
} from '$lib/content/constants/publicChannelConfig';
import { buildHumanizeChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { route } from '$lib/utils/path';

describe('publicHumanizeChannelConfig', () => {
	it('returns undefined for unknown slugs', () => {
		expect(getHumanizeChannelBySlug('')).toBeUndefined();
		expect(getHumanizeChannelBySlug('not-a-channel')).toBeUndefined();
	});

	it('omits channels that are not live from hub links and slug lookup', () => {
		const liveSlugs = new Set(listAvailablePublicChannels().map((channel) => channel.slug));
		const comingSoon = listPublicChannelsForHub().filter((channel) => !liveSlugs.has(channel.slug));

		for (const channel of comingSoon) {
			expect(getHumanizeChannelBySlug(channel.slug)).toBeUndefined();
			expect(listHumanizeChannelsForHub().some((item) => item.slug === channel.slug)).toBe(false);
		}
	});

	it('builds one hub link per live public channel', () => {
		const live = listAvailablePublicChannels();
		const hub = listHumanizeChannelsForHub();

		expect(hub).toHaveLength(live.length);
		expect(hub.length).toBeGreaterThan(0);

		for (const channel of live) {
			const link = hub.find((item) => item.slug === channel.slug);
			expect(link).toBeDefined();
			expect(link?.platformLabel).toBe(channel.platformLabel);
			expect(link?.icon).toBe(channel.icon);
			expect(link?.href).toBe(route(getRootPathPublicHumanizeChannel(channel.slug)));
			expect(link?.description.length).toBeGreaterThan(0);
			expect(/bypass|detector|homoglyph/i.test(link?.description ?? '')).toBe(false);
		}
	});

	it('tailors SEO meta for a live channel without classifier claims', () => {
		const linkedin = getHumanizeChannelBySlug('linkedin');
		expect(linkedin).toBeDefined();
		expect(linkedin?.metaTitle).toBe(buildHumanizeChannelMetaTitle('LinkedIn'));
		expect(linkedin?.focusedProviderIdentifier).toBe('linkedin');
		expect(linkedin?.metaDescription).toContain('LinkedIn');
		expect(linkedin?.metaDescription.toLowerCase()).toContain('no classifier guarantees');
		expect(linkedin?.keywords.some((keyword) => keyword.toLowerCase().includes('linkedin'))).toBe(
			true
		);
		expect(
			[linkedin?.metaTitle, linkedin?.metaDescription, ...((linkedin?.keywords as string[]) ?? [])]
				.join(' ')
				.toLowerCase()
		).not.toMatch(/bypass|detector|homoglyph/);
		expect(PUBLIC_HUMANIZE_GENERIC_CONFIG.metaTitle).not.toBe(linkedin?.metaTitle);
	});
});
