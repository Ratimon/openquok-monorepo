import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { FeaturesGridRowConfig } from '$data/landing-features-grid-types';
import { HERO_DIRECTORY_PLATFORMS } from '$data/landing-directory-platforms';

/** Tile config for landing-page social brand marks (hero strip + features grid). */
export type LandingSocialPlatform = {
	id: string;
	icon: IconName;
	label?: string;
	/** `/channels/{slug}` when tiles are linked (defaults from {@link resolveLandingSocialPlatformChannelSlug}). */
	channelSlug?: string;
	containerClass?: string;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
};

const GLYPH_TILE = 'bg-transparent p-0';
const GLYPH_SIZE = { iconClass: 'size-8', iconWidth: '32', iconHeight: '32' } as const;

/** Platforms shown in the hero icon strip row 1 (OAuth / scheduled publish). */
export const HERO_SOCIAL_PLATFORMS: LandingSocialPlatform[] = [
	{
		id: 'facebook',
		icon: icons.FacebookGlyph.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'instagram',
		icon: icons.InstagramGlyph.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
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
		id: 'youtube',
		icon: icons.YouTube.name,
		containerClass: 'bg-[#FF0000] text-white',
		iconClass: 'size-4'
	},
	{
		id: 'tiktok',
		icon: icons.TikTok.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'linkedin',
		icon: icons.LinkedInGlyph.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'x',
		icon: icons.X.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-6'
	},
	{
		id: 'bluesky',
		icon: icons.BlueskyGlyph.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'devto',
		icon: icons.DevtoGlyph.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'skool',
		icon: icons.SkoolGlyph.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	}
];

/** Hero row 2 — draft + member handoff (not server-side publish). */
export const HERO_DRAFT_HANDOFF_PLATFORMS: LandingSocialPlatform[] = [
	{
		id: 'reddit',
		icon: icons.Reddit.name,
		label: 'Reddit — draft in OpenQuok, you post on reddit.com',
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	}
];

/** Hero icon strip for `/browser-extension` (in-browser connect + handoff + directory). */
export const HERO_BROWSER_EXTENSION_PLATFORMS: LandingSocialPlatform[] = [
	HERO_SOCIAL_PLATFORMS.find((platform) => platform.id === 'skool')!,
	...HERO_DRAFT_HANDOFF_PLATFORMS,
	...HERO_DIRECTORY_PLATFORMS
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
		icon: icons.FacebookGlyph.name,
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
		icon: icons.LinkedInGlyph.name,
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
		id: 'devto',
		icon: icons.DevtoGlyph.name,
		label: 'Dev.to',
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'bluesky',
		icon: icons.BlueskyGlyph.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'skool',
		icon: icons.SkoolGlyph.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	},
	{
		id: 'reddit',
		icon: icons.Reddit.name,
		containerClass: GLYPH_TILE,
		...GLYPH_SIZE
	}
];

/** Staggered row layout — each `platformIds` entry appears at most once across all rows (4 + 4 + 4). */
export const FEATURES_GRID_SOCIAL_ROWS: FeaturesGridRowConfig[] = [
	{
		offsetClass: 'translate-x-4 sm:translate-x-6 md:translate-x-8',
		platformIds: ['facebook', 'instagram-business', 'threads', 'youtube']
	},
	{
		offsetClass: 'translate-x-0',
		platformIds: ['tiktok', 'linkedin', 'x', 'bluesky']
	},
	{
		offsetClass: '-translate-x-4 sm:-translate-x-6 md:-translate-x-8',
		platformIds: ['reddit', 'devto', 'skool', 'instagram-standalone']
	}
];

export function resolveLandingSocialPlatformChannelSlug(platform: LandingSocialPlatform): string {
	if (platform.channelSlug) return platform.channelSlug;
	if (platform.id === 'instagram-business' || platform.id === 'instagram-standalone') {
		return 'instagram';
	}
	return platform.id;
}

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
