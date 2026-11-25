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
		siteMetricsUpdatedAt: null,
		siteTitle: partial.siteTitle ?? null,
		extensionConfig: partial.extensionConfig ?? { steps: [] }
	};
}

describe('directorySiteKeyFromProviderSlug', () => {
	it('uses the segment before the first hyphen when no catalog slug matches', () => {
		expect(directorySiteKeyFromProviderSlug('uneed-join-line')).toBe('uneed');
	});

	it('resolves open-launch provider slugs to the open-launch site key', () => {
		expect(directorySiteKeyFromProviderSlug('open-launch-premium-launch')).toBe('open-launch');
		expect(directorySiteKeyFromProviderSlug('open-launch-free-launch')).toBe('open-launch');
	});

	it('resolves nick-launches provider slugs to the nick-launches site key', () => {
		expect(directorySiteKeyFromProviderSlug('nick-launches-free-launch')).toBe('nick-launches');
		expect(directorySiteKeyFromProviderSlug('nick-launches-maker-profile')).toBe('nick-launches');
	});

	it('resolves indiehub provider slugs to the indiehub site key', () => {
		expect(directorySiteKeyFromProviderSlug('indiehub-basic-launch')).toBe('indiehub');
		expect(directorySiteKeyFromProviderSlug('indiehub-pro-launch')).toBe('indiehub');
	});

	it('resolves alternativeto provider slugs to the alternativeto site key', () => {
		expect(directorySiteKeyFromProviderSlug('alternativeto-free-listing')).toBe('alternativeto');
		expect(directorySiteKeyFromProviderSlug('alternativeto-user-profile')).toBe('alternativeto');
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

	it('assigns bundled logo and branded icon for tinylaunch', () => {
		const tiles = buildDirectoryAddChannelTiles(
			[destination({ providerSlug: 'tinylaunch-premium-launch', siteTitle: 'TinyLaunch' })],
			new Map([['tinylaunch', { title: 'TinyLaunch', logoUrl: null }]])
		);
		expect(tiles[0]?.logoUrl).toBe('/icons/link-directory/tinylaunch.svg');
		expect(tiles[0]?.brandedIconName).toBe('TinyLaunch');
	});

	it('assigns bundled logo and branded icon for nick-launches', () => {
		const tiles = buildDirectoryAddChannelTiles(
			[
				destination({ providerSlug: 'nick-launches-free-launch', siteTitle: 'Nick Launches' }),
				destination({ providerSlug: 'nick-launches-maker-profile', sortOrder: 1 })
			],
			new Map([['nick-launches', { title: 'Nick Launches', logoUrl: null }]])
		);
		expect(tiles).toHaveLength(1);
		expect(tiles[0]?.logoUrl).toBe('/icons/link-directory/nick-launches.svg');
		expect(tiles[0]?.brandedIconName).toBe('NickLaunches');
	});

	it('assigns bundled logo and branded icon for indiehub', () => {
		const tiles = buildDirectoryAddChannelTiles(
			[
				destination({ providerSlug: 'indiehub-basic-launch', siteTitle: 'IndieHub' }),
				destination({ providerSlug: 'indiehub-pro-launch', sortOrder: 1 })
			],
			new Map([['indiehub', { title: 'IndieHub', logoUrl: null }]])
		);
		expect(tiles).toHaveLength(1);
		expect(tiles[0]?.logoUrl).toBe('/icons/link-directory/indiehub.svg');
		expect(tiles[0]?.brandedIconName).toBe('IndieHub');
	});

	it('assigns bundled logo and branded icon for alternativeto', () => {
		const tiles = buildDirectoryAddChannelTiles(
			[
				destination({ providerSlug: 'alternativeto-free-listing', siteTitle: 'AlternativeTo' }),
				destination({ providerSlug: 'alternativeto-priority-review', sortOrder: 1 })
			],
			new Map([['alternativeto', { title: 'AlternativeTo', logoUrl: null }]])
		);
		expect(tiles).toHaveLength(1);
		expect(tiles[0]?.logoUrl).toBe('/icons/link-directory/alternativeto.svg');
		expect(tiles[0]?.brandedIconName).toBe('AlternativeTo');
	});

	it('assigns bundled logo and branded icon for devhunt', () => {
		const tiles = buildDirectoryAddChannelTiles(
			[
				destination({ providerSlug: 'devhunt-paid-launch', siteTitle: 'DevHunt' }),
				destination({ providerSlug: 'devhunt-standard-launch', sortOrder: 1 })
			],
			new Map([['devhunt', { title: 'DevHunt', logoUrl: null }]])
		);
		expect(tiles).toHaveLength(1);
		expect(tiles[0]?.logoUrl).toBe('/icons/link-directory/devhunt.svg');
		expect(tiles[0]?.brandedIconName).toBe('DevHunt');
	});

	it('assigns bundled logo and branded icon for fazier', () => {
		const tiles = buildDirectoryAddChannelTiles(
			[
				destination({ providerSlug: 'fazier-page', siteTitle: 'Fazier' }),
				destination({ providerSlug: 'fazier-free-product-listing', sortOrder: 1 }),
				destination({ providerSlug: 'fazier-paid-product-listing', sortOrder: 2 })
			],
			new Map([['fazier', { title: 'Fazier', logoUrl: null }]])
		);
		expect(tiles).toHaveLength(1);
		expect(tiles[0]?.logoUrl).toBe('/icons/link-directory/fazier.svg');
		expect(tiles[0]?.brandedIconName).toBe('Fazier');
	});

	it('ignores non-extension destinations', () => {
		const tiles = buildDirectoryAddChannelTiles(
			[destination({ providerSlug: 'uneed-auto-only', submissionPath: 'auto' })],
			new Map()
		);
		expect(tiles).toHaveLength(0);
	});
});
