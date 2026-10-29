import type { DirectoryAddChannelTileVm } from '$lib/auto-launch/buildDirectoryAddChannelTiles';

export type LandingAddChannelProviderMock = {
	identifier: string;
	name: string;
	/** Uses browser extension connect flow when selected in the real modal. */
	extensionConnect?: boolean;
};

export const LANDING_ADD_CHANNEL_DIALOG_SOCIAL_PROVIDERS: readonly LandingAddChannelProviderMock[] =
	[
		{ identifier: 'facebook', name: 'Facebook' },
		{ identifier: 'instagram', name: 'Instagram' },
		{ identifier: 'linkedin', name: 'LinkedIn' },
		{ identifier: 'x', name: 'X (Twitter)' },
		{ identifier: 'skool', name: 'Skool', extensionConnect: true },
		{ identifier: 'reddit', name: 'Reddit', extensionConnect: true }
	];

export const LANDING_ADD_CHANNEL_DIALOG_DIRECTORY_TILES: readonly DirectoryAddChannelTileVm[] = [
	{
		siteKey: 'peerpush',
		label: 'PeerPush',
		logoUrl: '/icons/link-directory/peerpush.svg',
		brandedIconName: 'PeerPush',
		providerSlugPrefix: 'peerpush',
		dialogTitle: 'Launch to PeerPush'
	},
	{
		siteKey: 'uneed',
		label: 'Uneed',
		logoUrl: '/icons/link-directory/uneed.svg',
		brandedIconName: 'Uneed',
		providerSlugPrefix: 'uneed',
		dialogTitle: 'Launch to Uneed'
	}
];
