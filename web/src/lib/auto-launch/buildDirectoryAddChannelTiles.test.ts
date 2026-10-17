import { describe, expect, it } from 'vitest';

import type { AutoLaunchDestinationDto } from '$lib/auto-launch/auto-launch.types';

import {
	buildDirectoryAddChannelTiles,
	directoryAddChannelLogoFallbackLabel,
	directorySiteKeyFromProviderSlug
} from './buildDirectoryAddChannelTiles';

function destination(partial: Partial<AutoLaunchDestinationDto> & Pick<AutoLaunchDestinationDto, 'providerSlug'>): AutoLaunchDestinationDto {
	return {
		id: partial.id ?? '00000000-0000-4000-8000-000000000001',
		providerSlug: partial.providerSlug,
		name: partial.name ?? 'Destination',
		shortDescription: null,
		submissionPath: partial.submissionPath ?? 'extension',
		startUrl: 'https://example.com',
		sortOrder: partial.sortOrder ?? 0,
		opportunityDescription: null,
		opportunityTitle: null,
		opportunityDofollow: null,
		opportunityCostTier: null,
		opportunityCostNote: null,
		pickerGroupKey: null,
		pickerGroupTitle: null,
		siteDomainRating: null,
		siteTitle: partial.siteTitle ?? null,
		extensionConfig: partial.extensionConfig ?? { steps: [] }
	};
}

describe('directorySiteKeyFromProviderSlug', () => {
	it('uses the segment before the first hyphen when no catalog slug matches', () => {
		expect(directorySiteKeyFromProviderSlug('uneed-join-line')).toBe('uneed');
	});

	it('matches multi-segment published site slugs', () => {
		expect(directorySiteKeyFromProviderSlug('other-site-launch', ['other-site', 'other'])).toBe(
			'other-site'
		);
	});
});

describe('directoryAddChannelLogoFallbackLabel', () => {
	it('uses two letters for a single-word title', () => {
		expect(directoryAddChannelLogoFallbackLabel('Uneed')).toBe('UN');
	});

	it('uses initials for multi-word titles', () => {
		expect(directoryAddChannelLogoFallbackLabel('Product Hunt')).toBe('PH');
	});
});

describe('buildDirectoryAddChannelTiles', () => {
	it('groups extension destinations into one tile per site key', () => {
		const tiles = buildDirectoryAddChannelTiles(
			[
				destination({ providerSlug: 'uneed-join-line', siteTitle: 'Uneed' }),
				destination({ providerSlug: 'uneed-paid-launch', sortOrder: 1 }),
				destination({ providerSlug: 'other-site-launch', siteTitle: 'Other' })
			],
			new Map([
				['uneed', { title: 'Uneed', logoUrl: 'user/logo.webp' }],
				['other-site', { title: 'Other Site', logoUrl: null }]
			])
		);

		expect(tiles).toHaveLength(2);
		expect(tiles[0]?.siteKey).toBe('other-site');
		expect(tiles[1]?.siteKey).toBe('uneed');
		expect(tiles[1]?.providerSlugPrefix).toBe('uneed-');
		expect(tiles[1]?.logoUrl).toBe('/icons/link-directory/uneed.svg');
		expect(tiles[1]?.brandedIconName).toBe('Uneed');
	});

	it('assigns bundled logo and branded icon for peerpush', () => {
		const tiles = buildDirectoryAddChannelTiles(
			[destination({ providerSlug: 'peerpush-standard-launch', siteTitle: 'PeerPush' })],
			new Map([['peerpush', { title: 'PeerPush', logoUrl: 'https://www.openquok.com/icons/link-directory/peerpush.svg' }]])
		);
		expect(tiles[0]?.logoUrl).toBe('/icons/link-directory/peerpush.svg');
		expect(tiles[0]?.brandedIconName).toBe('PeerPush');
	});

	it('ignores non-extension destinations', () => {
		const tiles = buildDirectoryAddChannelTiles(
			[destination({ providerSlug: 'uneed-auto-only', submissionPath: 'auto' })],
			new Map()
		);
		expect(tiles).toHaveLength(0);
	});
});
