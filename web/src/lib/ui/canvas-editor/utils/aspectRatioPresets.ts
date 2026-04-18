export type AspectRatioPreset = {
	id: string;
	/** Compact label (ratio or short id) — export strip, legacy template keys. */
	label: string;
	/** Rich label for pickers, e.g. platform format name. Falls back to `label` in UI when absent. */
	menuTitle?: string;
	ratioW: number;
	ratioH: number;
	/** Target pixel size for PNG export (matches the ratio). */
	exportWidth: number;
	exportHeight: number;
	/** Optional one-line note for the UI (e.g. vertical video). */
	hint?: string;
};

/** Flat list: general ratios plus platform-named aliases (same pixels may appear under multiple ids). */
export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
	{
		id: '21:9',
		label: '21:9',
		menuTitle: 'Ultrawide',
		ratioW: 21,
		ratioH: 9,
		exportWidth: 2520,
		exportHeight: 1080
	},
	{
		id: '16:9',
		label: '16:9',
		menuTitle: 'Widescreen / HD',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 1920,
		exportHeight: 1080
	},
	{
		id: '5:4',
		label: '5:4',
		menuTitle: '5:4',
		ratioW: 5,
		ratioH: 4,
		exportWidth: 1280,
		exportHeight: 1024
	},
	{
		id: '4:3',
		label: '4:3',
		menuTitle: '4:3',
		ratioW: 4,
		ratioH: 3,
		exportWidth: 1600,
		exportHeight: 1200
	},
	{
		id: '3:2',
		label: '3:2',
		menuTitle: '3:2',
		ratioW: 3,
		ratioH: 2,
		exportWidth: 1800,
		exportHeight: 1200
	},
	{
		id: '1:1',
		label: '1:1',
		menuTitle: 'Square',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080
	},
	{
		id: '2:3',
		label: '2:3',
		menuTitle: 'Portrait 2:3',
		ratioW: 2,
		ratioH: 3,
		exportWidth: 1080,
		exportHeight: 1620
	},
	{
		id: '3:4',
		label: '3:4',
		menuTitle: 'Portrait 3:4',
		ratioW: 3,
		ratioH: 4,
		exportWidth: 1080,
		exportHeight: 1440
	},
	{
		id: '4:5',
		label: '4:5',
		menuTitle: 'Portrait 4:5',
		ratioW: 4,
		ratioH: 5,
		exportWidth: 1080,
		exportHeight: 1350
	},
	{
		id: '9:16',
		label: '9:16',
		menuTitle: 'Vertical 9:16',
		ratioW: 9,
		ratioH: 16,
		exportWidth: 1080,
		exportHeight: 1920,
		hint: 'Vertical video (1080×1920): short-form feeds and full-screen mobile.'
	},
	/* Instagram */
	{
		id: 'ig-story-reel',
		label: 'IG Story/Reel',
		menuTitle: 'Story / Reel',
		ratioW: 9,
		ratioH: 16,
		exportWidth: 1080,
		exportHeight: 1920,
		hint: '1080×1920 — Stories, Reels, full-screen vertical.'
	},
	{
		id: 'ig-feed-45',
		label: 'IG 4:5',
		menuTitle: 'Feed post (4:5)',
		ratioW: 4,
		ratioH: 5,
		exportWidth: 1080,
		exportHeight: 1350
	},
	{
		id: 'ig-feed-square',
		label: 'IG 1:1',
		menuTitle: 'Feed post (square)',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080
	},
	{
		id: 'ig-landscape',
		label: 'IG 1.91:1',
		menuTitle: 'Feed (landscape)',
		ratioW: 1080,
		ratioH: 566,
		exportWidth: 1080,
		exportHeight: 566,
		hint: 'Landscape link / image post in feed (~1.91:1).'
	},
	/* TikTok */
	{
		id: 'tt-video',
		label: 'TikTok',
		menuTitle: 'Vertical (9:16)',
		ratioW: 9,
		ratioH: 16,
		exportWidth: 1080,
		exportHeight: 1920,
		hint: 'Primary size for in-feed video and photo carousels (Photo Mode).'
	},
	{
		id: 'tt-carousel-square',
		label: 'TikTok',
		menuTitle: 'Carousel (1:1)',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080,
		hint: 'Photo carousel; supported—may show padding in vertical feed.'
	},
	{
		id: 'tt-carousel-45',
		label: 'TikTok',
		menuTitle: 'Carousel (4:5)',
		ratioW: 4,
		ratioH: 5,
		exportWidth: 1080,
		exportHeight: 1350,
		hint: 'Photo carousel portrait; supported alternative to 9:16.'
	},
	{
		id: 'tt-horizontal',
		label: 'TikTok',
		menuTitle: 'Horizontal (16:9)',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 1920,
		exportHeight: 1080,
		hint: 'Landscape video; long-form and widescreen uploads.'
	},
	/* Facebook */
	{
		id: 'fb-feed-post',
		label: 'FB feed',
		menuTitle: 'Feed post',
		ratioW: 235,
		ratioH: 197,
		exportWidth: 940,
		exportHeight: 788,
		hint: 'Common feed image ratio (~1.2:1).'
	},
	{
		id: 'fb-video-square',
		label: 'FB video 1:1',
		menuTitle: 'In-feed video (1:1)',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080
	},
	{
		id: 'fb-story',
		label: 'FB Story',
		menuTitle: 'Stories',
		ratioW: 9,
		ratioH: 16,
		exportWidth: 1080,
		exportHeight: 1920
	},
	/* YouTube */
	{
		id: 'yt-hd',
		label: 'YouTube 16:9',
		menuTitle: 'Horizontal video',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 1920,
		exportHeight: 1080
	},
	{
		id: 'yt-shorts',
		label: 'Shorts',
		menuTitle: 'Shorts',
		ratioW: 9,
		ratioH: 16,
		exportWidth: 1080,
		exportHeight: 1920
	},
	/* LinkedIn */
	{
		id: 'li-share',
		label: 'LinkedIn',
		menuTitle: 'Shared image / link',
		ratioW: 400,
		ratioH: 209,
		exportWidth: 1200,
		exportHeight: 627,
		hint: 'Typical link / article share image.'
	},
	/* X */
	{
		id: 'x-image-169',
		label: 'X 16:9',
		menuTitle: 'Post image (16:9)',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 1200,
		exportHeight: 675
	},
	{
		id: 'x-image-11',
		label: 'X 1:1',
		menuTitle: 'Post image (square)',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080
	},
	// /* Pinterest */
	// {
	// 	id: 'pin-standard',
	// 	label: 'Pin 2:3',
	// 	menuTitle: 'Standard pin',
	// 	ratioW: 2,
	// 	ratioH: 3,
	// 	exportWidth: 1000,
	// 	exportHeight: 1500
	// },
	// /* Snapchat */
	// {
	// 	id: 'sc-story',
	// 	label: 'Snapchat',
	// 	menuTitle: 'Story',
	// 	ratioW: 9,
	// 	ratioH: 16,
	// 	exportWidth: 1080,
	// 	exportHeight: 1920
	// }
];

export type AspectPlatformGroup = {
	id: string;
	title: string;
	presetIds: readonly string[];
};

/** Tabs for the shifting picker: one platform → many format presets (by id). */
export const ASPECT_RATIO_PLATFORM_GROUPS: readonly AspectPlatformGroup[] = [
	{
		id: 'general',
		title: 'General',
		presetIds: ['21:9', '16:9', '5:4', '4:3', '3:2', '1:1', '2:3', '3:4', '4:5', '9:16']
	},
	{
		id: 'instagram',
		title: 'Instagram',
		presetIds: ['ig-story-reel', 'ig-feed-45', 'ig-feed-square', 'ig-landscape']
	},
	{
		id: 'tiktok',
		title: 'TikTok',
		presetIds: ['tt-video', 'tt-carousel-square', 'tt-carousel-45', 'tt-horizontal']
	},
	{
		id: 'facebook',
		title: 'Facebook',
		presetIds: ['fb-feed-post', 'fb-video-square', 'fb-story']
	},
	{
		id: 'youtube',
		title: 'YouTube',
		presetIds: ['yt-hd', 'yt-shorts']
	},
	{ id: 'linkedin', title: 'LinkedIn', presetIds: ['li-share'] },
	{ id: 'x', title: 'X', presetIds: ['x-image-169', 'x-image-11'] },
	{ id: 'pinterest', title: 'Pinterest', presetIds: ['pin-standard'] },
	{ id: 'snapchat', title: 'Snapchat', presetIds: ['sc-story'] }
] as const;

const PRESET_BY_ID = new Map(ASPECT_RATIO_PRESETS.map((p) => [p.id, p]));

export const DEFAULT_ASPECT_RATIO_ID = '16:9';

/**
 * Maps a connected social integration `identifier` to a tab id in {@link ASPECT_RATIO_PLATFORM_GROUPS}.
 * Unknown or empty identifiers resolve to `general`.
 */
export function aspectPlatformGroupIdForProviderIdentifier(identifier: string | null | undefined): string {
	const id = (identifier ?? '').trim().toLowerCase();
	if (!id) return 'general';
	if (id === 'tiktok') return 'tiktok';
	if (id.startsWith('instagram')) return 'instagram';
	if (id === 'threads') return 'instagram';
	if (id === 'facebook') return 'facebook';
	if (id === 'youtube') return 'youtube';
	if (id === 'x' || id === 'twitter') return 'x';
	if (id === 'linkedin') return 'linkedin';
	return 'general';
}

/** First preset id in a platform group that exists in {@link ASPECT_RATIO_PRESETS} (skips commented-out ids). */
export function firstAspectPresetIdInGroup(groupId: string): string | null {
	const g = ASPECT_RATIO_PLATFORM_GROUPS.find((x) => x.id === groupId);
	if (!g) return null;
	for (const pid of g.presetIds) {
		if (PRESET_BY_ID.has(pid)) return pid;
	}
	return null;
}

/**
 * Default canvas aspect for the design dialog from the composer.
 * When `providerIdentifier` is set (single selected channel in global mode, or focused/single channel in custom), uses that platform’s first preset; otherwise General 16:9.
 * `mode` is kept for call-site clarity; resolution is driven by the resolved provider when present.
 */
export function defaultAspectRatioIdForComposer(
	_mode: 'global' | 'custom',
	providerIdentifier: string | null | undefined
): string {
	const id = (providerIdentifier ?? '').trim();
	if (!id) return DEFAULT_ASPECT_RATIO_ID;
	const gid = aspectPlatformGroupIdForProviderIdentifier(id);
	if (gid === 'general') return DEFAULT_ASPECT_RATIO_ID;
	return firstAspectPresetIdInGroup(gid) ?? DEFAULT_ASPECT_RATIO_ID;
}

export function getAspectPresetById(id: string): AspectRatioPreset {
	return PRESET_BY_ID.get(id) ?? PRESET_BY_ID.get(DEFAULT_ASPECT_RATIO_ID)!;
}

/** Single-line title for toolbar / lists. */
export function aspectPresetDisplayLine(p: AspectRatioPreset): string {
	const title = p.menuTitle ?? p.label;
	return `${title} (${p.exportWidth}×${p.exportHeight})`;
}
