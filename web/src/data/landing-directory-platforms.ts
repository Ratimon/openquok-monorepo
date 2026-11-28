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
	},
	{
		id: 'tinylaunch',
		channelSlug: 'tinylaunch',
		icon: icons.TinyLaunch.name,
		label: 'TinyLaunch',
		containerClass: 'bg-transparent p-0',
		iconClass: 'size-8',
		iconWidth: '32',
		iconHeight: '32'
	},
	{
		id: 'fazier',
		channelSlug: 'fazier',
		icon: icons.Fazier.name,
		label: 'Fazier',
		containerClass: 'bg-transparent p-0',
		iconClass: 'size-8',
		iconWidth: '32',
		iconHeight: '32'
	},
	{
		id: 'devhunt',
		channelSlug: 'devhunt',
		icon: icons.DevHunt.name,
		label: 'DevHunt',
		containerClass: 'bg-transparent p-0',
		iconClass: 'size-8',
		iconWidth: '32',
		iconHeight: '32'
	},
	{
		id: 'nick-launches',
		channelSlug: 'nick-launches',
		icon: icons.NickLaunches.name,
		label: 'Nick Launches',
		containerClass: 'bg-transparent p-0',
		iconClass: 'size-8',
		iconWidth: '32',
		iconHeight: '32'
	},
	{
		id: 'indiehub',
		channelSlug: 'indiehub',
		icon: icons.IndieHub.name,
		label: 'IndieHub',
		containerClass: 'bg-transparent p-0',
		iconClass: 'size-8',
		iconWidth: '32',
		iconHeight: '32'
	},
	{
		id: 'alternativeto',
		channelSlug: 'alternativeto',
		icon: icons.AlternativeTo.name,
		label: 'AlternativeTo',
		containerClass: 'bg-transparent p-0',
		iconClass: 'size-8',
		iconWidth: '32',
		iconHeight: '32'
	},
	{
		id: 'startupinspire',
		channelSlug: 'startupinspire',
		icon: icons.StartupInspire.name,
		label: 'StartupInspire',
		containerClass: 'bg-transparent p-0',
		iconClass: 'size-8',
		iconWidth: '32',
		iconHeight: '32'
	},
	{
		id: 'trustpilot',
		channelSlug: 'trustpilot',
		icon: icons.Trustpilot.name,
		label: 'Trustpilot',
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
		platformIds: [
			'peerpush',
			'uneed',
			'open-launch',
			'tinylaunch',
			'fazier',
			'devhunt',
			'nick-launches',
			'indiehub',
			'alternativeto',
			'startupinspire',
			'trustpilot'
		]
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
