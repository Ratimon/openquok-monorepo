import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

/** Tile config for landing-page social brand marks (hero strip + features grid). */
export type LandingSocialPlatform = {
	id: string;
	icon: IconName;
	label?: string;
	containerClass?: string;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
};

const GLYPH_TILE = 'bg-transparent p-0';
const GLYPH_SIZE = { iconClass: 'size-8', iconWidth: '32', iconHeight: '32' } as const;

/** Platforms shown in the hero icon strip (compact set). */
export const HERO_SOCIAL_PLATFORMS: LandingSocialPlatform[] = [
	{
		id: 'x',
		icon: icons.X.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-6'
	},
	{
		id: 'instagram',
		icon: icons.InstagramGlyph.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'linkedin',
		icon: icons.LinkedIn.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'facebook',
		icon: icons.Facebook.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'tiktok',
		icon: icons.TikTok.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'youtube',
		icon: icons.YouTube.name,
		containerClass: 'bg-[#FF0000] text-white',
		iconClass: 'size-4'
	},
	{
		id: 'threads',
		icon: icons.Threads.name,
		containerClass: 'bg-neutral-900 text-white',
		iconClass: 'size-5',
		iconWidth: '20',
		iconHeight: '20'
	},
	{
		id: 'google',
		icon: icons.Google.name,
		label: 'Google Business',
		containerClass: 'bg-white',
		iconClass: 'size-5',
		iconWidth: '20',
		iconHeight: '20'
	}
];

/** Full supported-channel set for the landing features grid (analytics + live OAuth providers). */
export const FEATURES_GRID_SOCIAL_PLATFORMS: LandingSocialPlatform[] = [
	{
		id: 'threads',
		icon: icons.Threads.name,
		containerClass: 'bg-neutral-900 text-white',
		iconClass: 'size-7',
		iconWidth: '28',
		iconHeight: '28'
	},
	{
		id: 'instagram-business',
		icon: icons.Instagram.name,
		label: 'Instagram (Business)',
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'instagram-standalone',
		icon: icons.InstagramGlyph.name,
		label: 'Instagram (Standalone)',
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'facebook',
		icon: icons.Facebook.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'youtube',
		icon: icons.YouTube.name,
		containerClass: 'bg-[#FF0000] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'tiktok',
		icon: icons.TikTok.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'linkedin',
		icon: icons.LinkedIn.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'x',
		icon: icons.X.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'google',
		icon: icons.Google.name,
		label: 'Google Business',
		containerClass: 'bg-white',
		iconClass: 'size-6',
		iconWidth: '24',
		iconHeight: '24'
	}
];

/** Staggered row layout — each `platformIds` entry appears at most once across all rows. */
export const FEATURES_GRID_SOCIAL_ROWS: { offsetClass: string; platformIds: string[] }[] = [
	{
		offsetClass: 'translate-x-6 sm:translate-x-10 md:translate-x-14',
		platformIds: ['threads', 'instagram-business', 'facebook']
	},
	{
		offsetClass: 'translate-x-0',
		platformIds: ['youtube', 'tiktok', 'linkedin']
	},
	{
		offsetClass: '-translate-x-4 sm:-translate-x-8 md:-translate-x-12',
		platformIds: ['x', 'instagram-standalone', 'google']
	}
];

const platformById = new Map(
	FEATURES_GRID_SOCIAL_PLATFORMS.map((platform) => [platform.id, platform])
);

export function featuresGridPlatformsForRow(platformIds: string[]): LandingSocialPlatform[] {
	const out: LandingSocialPlatform[] = [];
	for (const id of platformIds) {
		const platform = platformById.get(id);
		if (platform) out.push(platform);
	}
	return out;
}
