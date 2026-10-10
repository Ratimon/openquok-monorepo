import { describe, expect, it } from 'vitest';

import {
	getSkillBuilderChannelBySlug,
	listSkillBuilderCatalogChannels,
	listSkillBuilderChannelsForHub
} from '$lib/content/constants/channels/tools/skill-builder/general';
import { listAvailablePublicChannels } from '$lib/content/constants/channels';
import { getRootPathPublicSkillBuilderChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import { route } from '$lib/utils/path';

describe('skill-builder catalog channels', () => {
	it('includes Skool with recipes while scheduler is coming soon', () => {
		const skool = getSkillBuilderChannelBySlug('skool');
		expect(skool).toBeDefined();
		expect(skool?.schedulerAvailable).toBe(false);
		expect(skool?.recipes.length).toBeGreaterThan(0);

		const hubLink = listSkillBuilderChannelsForHub().find((item) => item.slug === 'skool');
		expect(hubLink).toBeDefined();
		expect(hubLink?.schedulerAvailable).toBe(false);
		expect(hubLink?.href).toBe(route(getRootPathPublicSkillBuilderChannel('skool')));
	});

	it('includes every live channel and only coming-soon channels with recipes', () => {
		const liveSlugs = new Set(listAvailablePublicChannels().map((channel) => channel.slug));
		const catalog = listSkillBuilderCatalogChannels();

		for (const slug of liveSlugs) {
			expect(catalog.some((channel) => channel.slug === slug)).toBe(true);
		}

		expect(catalog.some((channel) => channel.slug === 'skool')).toBe(true);
		expect(listSkillBuilderChannelsForHub().length).toBe(catalog.length);
	});
});
