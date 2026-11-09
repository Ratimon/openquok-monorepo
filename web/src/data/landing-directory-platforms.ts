import { icons } from '$data/icons';

import type { FeaturesGridRowConfig, LandingSocialPlatform } from '$data/landing-features-grid-types';

/** Directory launch tiles for marketing grids and the home hero (row 3). */
export const FEATURES_GRID_DIRECTORY_PLATFORMS: LandingSocialPlatform[] = [
	{
		id: 'peerpush',
		channelSlug: 'peerpush',
		icon: icons.PeerPush.name,
		label: 'PeerPush',
		containerClass: 'bg-transparent p-0',
		iconClass: 'size-8',
		iconWidth: '32',
		iconHeight: '32'
	},
	{
		id: 'uneed',
		channelSlug: 'uneed',
		icon: icons.Uneed.name,
		label: 'Uneed',
		containerClass: 'bg-transparent p-0',
		iconClass: 'size-8',
		iconWidth: '32',
		iconHeight: '32'
	},
	{
		id: 'open-launch',
		channelSlug: 'open-launch',
		icon: icons.OpenLaunch.name,
		label: 'Open Launch',
		containerClass: 'bg-transparent p-0',
		iconClass: 'size-8',
		iconWidth: '32',
		iconHeight: '32'
	}
];

/** Home hero icon strip — same tiles as {@link FEATURES_GRID_DIRECTORY_PLATFORMS}. */
export const HERO_DIRECTORY_PLATFORMS = FEATURES_GRID_DIRECTORY_PLATFORMS;

export const FEATURES_GRID_DIRECTORY_ROWS: FeaturesGridRowConfig[] = [
	{
		offsetClass: 'translate-x-0',
		platformIds: ['peerpush', 'uneed', 'open-launch']
	}
];

const directoryPlatformById = new Map(
	FEATURES_GRID_DIRECTORY_PLATFORMS.map((platform) => [platform.id, platform])
);

export function featuresGridDirectoryPlatformsForRow(platformIds: string[]): LandingSocialPlatform[] {
	const out: LandingSocialPlatform[] = [];
	for (const id of platformIds) {
		const platform = directoryPlatformById.get(id);
		if (platform) out.push(platform);
	}
	return out;
}

export function resolveLandingDirectoryPlatformChannelSlug(platform: LandingSocialPlatform): string {
	return platform.channelSlug ?? platform.id;
}

export function isLandingDirectoryPlatformId(platformId: string): boolean {
	return directoryPlatformById.has(platformId);
}
