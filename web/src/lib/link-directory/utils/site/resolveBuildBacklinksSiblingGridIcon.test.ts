import { describe, expect, it } from 'vitest';

import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';

import { icons } from '$data/icons';

import { getChannelSeedBySlug } from '$lib/content/constants/channels/catalog/channelCatalogLookup';
import { resolveBuildBacklinksSiblingGridIcon } from '$lib/link-directory/utils/site/resolveBuildBacklinksSiblingGridIcon';

function makeSite(
	overrides: Partial<Pick<LinkDirectorySiteDto, 'slug' | 'openquokChannelSlug'>>
): Pick<LinkDirectorySiteDto, 'slug' | 'openquokChannelSlug'> {
	return {
		slug: 'example',
		openquokChannelSlug: null,
		...overrides
	};
}

describe('resolveBuildBacklinksSiblingGridIcon', () => {
	it('uses the social channel catalog icon when openquokChannelSlug is set', () => {
		const site = makeSite({ slug: 'threads-backlinks', openquokChannelSlug: 'threads' });
		expect(resolveBuildBacklinksSiblingGridIcon(site)).toBe(getChannelSeedBySlug('threads')?.icon);
	});

	it('uses the directory channel catalog icon via build-backlinks slug mapping', () => {
		const site = makeSite({ slug: 'uneed', openquokChannelSlug: null });
		expect(resolveBuildBacklinksSiblingGridIcon(site)).toBe(getChannelSeedBySlug('uneed')?.icon);
	});

	it('uses branded browser store icons when no channel catalog exists', () => {
		expect(
			resolveBuildBacklinksSiblingGridIcon(
				makeSite({ slug: 'microsoft-edge-addons', openquokChannelSlug: null })
			)
		).toBe(icons.MicrosoftEdge.name);
	});

	it('falls back to Link when no channel or branded icon matches', () => {
		expect(
			resolveBuildBacklinksSiblingGridIcon(makeSite({ slug: 'unknown-site', openquokChannelSlug: null }))
		).toBe(icons.Link.name);
	});
});