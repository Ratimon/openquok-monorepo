import { describe, expect, it } from 'vitest';

import {
	getHumanizeChannelBySlug,
	listHumanizeChannelsForHub,
	PUBLIC_HUMANIZE_GENERIC_CONFIG
} from '$lib/ai-humanize/constants/publicHumanizeChannelConfig';
import { getRootPathPublicHumanizerChannel } from '$lib/area-public/constants/getRootPathPublicTools';
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

	it('includes coming-soon catalog channels as sample Humanizer pages', () => {
		const liveSlugs = new Set(listAvailablePublicChannels().map((channel) => channel.slug));
		const comingSoon = listPublicChannelsForHub().filter((channel) => !liveSlugs.has(channel.slug));

		expect(comingSoon.map((channel) => channel.slug)).toEqual(
			expect.arrayContaining(['facebook', 'instagram', 'threads'])
		);

		for (const channel of comingSoon) {
			expect(getHumanizeChannelBySlug(channel.slug)).toBeDefined();
			expect(listHumanizeChannelsForHub().some((item) => item.slug === channel.slug)).toBe(true);
		}
	});

	it('builds one hub link per public catalog channel', () => {
		const catalog = listPublicChannelsForHub();
		const hub = listHumanizeChannelsForHub();

		expect(hub).toHaveLength(catalog.length);
		expect(hub.length).toBeGreaterThan(0);

		for (const channel of catalog) {
			const link = hub.find((item) => item.slug === channel.slug);
			expect(link).toBeDefined();
			expect(link?.platformLabel).toBe(channel.platformLabel);
			expect(link?.icon).toBe(channel.icon);
			expect(link?.href).toBe(route(getRootPathPublicHumanizerChannel(channel.slug)));
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
		expect(linkedin?.metaDescription.toLowerCase()).toContain('for free');
		expect(linkedin?.metaDescription.length).toBeLessThanOrEqual(160);
		expect(linkedin?.metaDescription.toLowerCase()).not.toContain('no classifier guarantees');
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
