import { describe, expect, it } from 'vitest';

import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';

import {
	resolveDirectoryChannelPlatformLabelForBuildBacklinksSite,
	resolveDirectoryChannelSlugForBuildBacklinksSite
} from '$lib/link-directory/utils/site/resolveDirectoryChannelSlugForBuildBacklinksSite';

function makeSite(
	overrides: Partial<Pick<LinkDirectorySiteDto, 'slug' | 'openquokChannelSlug'>>
): Pick<LinkDirectorySiteDto, 'slug' | 'openquokChannelSlug'> {
	return {
		slug: 'example',
		openquokChannelSlug: null,
		...overrides
	};
}

describe('resolveDirectoryChannelSlugForBuildBacklinksSite', () => {
	it('uses openquokChannelSlug when it is a directory catalog slug', () => {
		expect(
			resolveDirectoryChannelSlugForBuildBacklinksSite(
				makeSite({ slug: 'peerpush', openquokChannelSlug: 'peerpush' })
			)
		).toBe('peerpush');
	});

	it('maps build-backlinks slug to directory channel when site field is empty', () => {
		expect(
			resolveDirectoryChannelSlugForBuildBacklinksSite(makeSite({ slug: 'fazier', openquokChannelSlug: null }))
		).toBe('fazier');
	});

	it('returns null when no directory channel matches', () => {
		expect(
			resolveDirectoryChannelSlugForBuildBacklinksSite(makeSite({ slug: 'reddit', openquokChannelSlug: null }))
		).toBeNull();
	});

	it('resolves platform label from the directory catalog', () => {
		expect(
			resolveDirectoryChannelPlatformLabelForBuildBacklinksSite(
				makeSite({ slug: 'peerpush', openquokChannelSlug: 'peerpush' })
			)
		).toBe('PeerPush');
	});
});