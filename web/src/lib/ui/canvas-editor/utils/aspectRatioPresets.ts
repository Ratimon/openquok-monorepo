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
		exportHeight: 1080,
		hint: '2520×1080 — ultrawide displays.'
	},
	{
		id: '16:9',
		label: '16:9',
		menuTitle: 'Widescreen / HD',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 1920,
		exportHeight: 1080,
		hint: '1920×1080 — common HD video and screens.'
	},
	{
		id: '5:4',
		label: '5:4',
		menuTitle: '5:4',
		ratioW: 5,
		ratioH: 4,
		exportWidth: 1280,
		exportHeight: 1024,
		hint: '1280×1024 — classic monitor ratio.'
	},
	{
		id: '4:3',
		label: '4:3',
		menuTitle: '4:3',
		ratioW: 4,
		ratioH: 3,
		exportWidth: 1600,
		exportHeight: 1200,
		hint: '1600×1200 — classic photo / display.'
	},
	{
		id: '3:2',
		label: '3:2',
		menuTitle: '3:2',
		ratioW: 3,
		ratioH: 2,
		exportWidth: 1800,
		exportHeight: 1200,
		hint: '1800×1200 — common still-photo ratio.'
	},
	{
		id: '1:1',
		label: '1:1',
		menuTitle: 'Square',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080,
		hint: '1080×1080 — square.'
	},
	{
		id: '2:3',
		label: '2:3',
		menuTitle: 'Portrait 2:3',
		ratioW: 2,
		ratioH: 3,
		exportWidth: 1080,
		exportHeight: 1620,
		hint: '1080×1620 — portrait stills (2:3).'
	},
	{
		id: '3:4',
		label: '3:4',
		menuTitle: 'Portrait 3:4',
		ratioW: 3,
		ratioH: 4,
		exportWidth: 1080,
		exportHeight: 1440,
		hint: '1080×1440 — portrait (3:4).'
	},
	{
		id: '4:5',
		label: '4:5',
		menuTitle: 'Portrait 4:5',
		ratioW: 4,
		ratioH: 5,
		exportWidth: 1080,
		exportHeight: 1350,
		hint: '1080×1350 — tall portrait (4:5).'
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
	/* Instagram — order: square post → portrait feed → vertical → ad → landscape */
	{
		id: 'ig-post',
		label: 'Instagram',
		menuTitle: 'Post',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080,
		hint: '1080×1080 — square feed post.'
	},
	{
		id: 'ig-feed-45',
		label: 'Instagram',
		menuTitle: 'Feed post (4:5)',
		ratioW: 4,
		ratioH: 5,
		exportWidth: 1080,
		exportHeight: 1350,
		hint: '1080×1350 — portrait feed post (4:5).'
	},
	{
		id: 'ig-story-reel',
		label: 'Instagram',
		menuTitle: 'Story / Reel',
		ratioW: 9,
		ratioH: 16,
		exportWidth: 1080,
		exportHeight: 1920,
		hint: '1080×1920 — Stories, Reels, full-screen vertical.'
	},
	{
		id: 'ig-ad',
		label: 'Instagram',
		menuTitle: 'Ad',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080,
		hint: '1080×1080 — square ad creative.'
	},
	{
		id: 'ig-landscape',
		label: 'Instagram',
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
		id: 'fb-post-landscape',
		label: 'Facebook',
		menuTitle: 'Post (Landscape)',
		ratioW: 40,
		ratioH: 21,
		exportWidth: 1200,
		exportHeight: 630,
		hint: '1200×630 — link / landscape feed image.'
	},
	{
		id: 'fb-post-square',
		label: 'Facebook',
		menuTitle: 'Post (Square)',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080,
		hint: '1080×1080 — square feed post.'
	},
	{
		id: 'fb-cover',
		label: 'Facebook',
		menuTitle: 'Cover',
		ratioW: 851,
		ratioH: 315,
		exportWidth: 851,
		exportHeight: 315,
		hint: '851×315 — page cover photo.'
	},
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
		exportHeight: 1080,
		hint: '1080×1080 — square in-feed video.'
	},
	{
		id: 'fb-story',
		label: 'FB Story',
		menuTitle: 'Stories',
		ratioW: 9,
		ratioH: 16,
		exportWidth: 1080,
		exportHeight: 1920,
		hint: '1080×1920 — Facebook Stories.'
	},
	/* YouTube */
	{
		id: 'yt-thumbnail',
		label: 'YouTube',
		menuTitle: 'Thumbnail',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 1280,
		exportHeight: 720,
		hint: '1280×720 — standard thumbnail.'
	},
	{
		id: 'yt-channel',
		label: 'YouTube',
		menuTitle: 'Channel',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 2560,
		exportHeight: 1440,
		hint: '2560×1440 — channel art safe area varies by device.'
	},
	{
		id: 'yt-hd',
		label: 'YouTube 16:9',
		menuTitle: 'Horizontal video',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 1920,
		exportHeight: 1080,
		hint: '1920×1080 — standard horizontal YouTube video.'
	},
	{
		id: 'yt-shorts',
		label: 'Shorts',
		menuTitle: 'Shorts',
		ratioW: 9,
		ratioH: 16,
		exportWidth: 1080,
		exportHeight: 1920,
		hint: '1080×1920 — Shorts vertical format.'
	},
	/* LinkedIn */
	{
		id: 'li-share',
		label: 'LinkedIn',
		menuTitle: 'Post',
		ratioW: 400,
		ratioH: 209,
		exportWidth: 1200,
		exportHeight: 627,
		hint: '1200×627 — typical link / article share image.'
	},
	{
		id: 'li-banner',
		label: 'LinkedIn',
		menuTitle: 'Banner',
		ratioW: 4,
		ratioH: 1,
		exportWidth: 1584,
		exportHeight: 396,
		hint: '1584×396 — profile / company banner.'
	},
	{
		id: 'li-square',
		label: 'LinkedIn',
		menuTitle: 'Square',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080,
		hint: '1080×1080 — square post.'
	},
	/* X / Twitter */
	{
		id: 'x-post',
		label: 'X',
		menuTitle: 'Post',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 1600,
		exportHeight: 900,
		hint: '1600×900 — landscape post image.'
	},
	{
		id: 'x-header',
		label: 'X',
		menuTitle: 'Header',
		ratioW: 3,
		ratioH: 1,
		exportWidth: 1500,
		exportHeight: 500,
		hint: '1500×500 — profile header.'
	},
	{
		id: 'x-image-169',
		label: 'X 16:9',
		menuTitle: 'Post image (16:9)',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 1200,
		exportHeight: 675,
		hint: '1200×675 — legacy 16:9 post image size.'
	},
	{
		id: 'x-image-11',
		label: 'X 1:1',
		menuTitle: 'Square',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080,
		hint: '1080×1080 — square post image.'
	},
	/* Pinterest */
	{
		id: 'pin-standard',
		label: 'Pin 2:3',
		menuTitle: 'Standard pin',
		ratioW: 2,
		ratioH: 3,
		exportWidth: 1000,
		exportHeight: 1500,
		hint: '1000×1500 — standard Pinterest pin (2:3).'
	},
	/* Snapchat */
	{
		id: 'sc-story',
		label: 'Snapchat',
		menuTitle: 'Story',
		ratioW: 9,
		ratioH: 16,
		exportWidth: 1080,
		exportHeight: 1920,
		hint: '1080×1920 — full-screen Story.'
	},
	/* Video (general) */
	{
		id: 'video-fhd',
		label: 'Video',
		menuTitle: 'Full HD',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 1920,
		exportHeight: 1080,
		hint: '1920×1080 — Full HD (1080p).'
	},
	{
		id: 'video-4k',
		label: 'Video',
		menuTitle: '4K UHD',
		ratioW: 16,
		ratioH: 9,
		exportWidth: 3840,
		exportHeight: 2160,
		hint: '3840×2160 — 4K UHD.'
	},
	{
		id: 'video-vertical-hd',
		label: 'Video',
		menuTitle: 'Vertical HD',
		ratioW: 9,
		ratioH: 16,
		exportWidth: 1080,
		exportHeight: 1920,
		hint: '1080×1920 — vertical HD.'
	},
	{
		id: 'video-square-hd',
		label: 'Video',
		menuTitle: 'Square HD',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1080,
		exportHeight: 1080,
		hint: '1080×1080 — square HD.'
	},
	/* Print — export pixels at 300 DPI unless noted */
	{
		id: 'print-invitation-14cm',
		label: 'Print',
		menuTitle: 'Invitation',
		ratioW: 1,
		ratioH: 1,
		exportWidth: 1654,
		exportHeight: 1654,
		hint: '14×14 cm @ 300 DPI (~1654×1654 px).'
	},
	{
		id: 'print-a4-portrait',
		label: 'Print',
		menuTitle: 'A4 Portrait',
		ratioW: 210,
		ratioH: 297,
		exportWidth: 2480,
		exportHeight: 3508,
		hint: 'ISO A4 portrait @ 300 DPI.'
	},
	{
		id: 'print-a4-landscape',
		label: 'Print',
		menuTitle: 'A4 Landscape',
		ratioW: 297,
		ratioH: 210,
		exportWidth: 3508,
		exportHeight: 2480,
		hint: 'ISO A4 landscape @ 300 DPI.'
	},
	{
		id: 'print-a3',
		label: 'Print',
		menuTitle: 'A3',
		ratioW: 297,
		ratioH: 420,
		exportWidth: 3508,
		exportHeight: 4961,
		hint: 'ISO A3 @ 300 DPI.'
	},
	{
		id: 'print-letter-portrait',
		label: 'Print',
		menuTitle: 'Letter Portrait',
		ratioW: 17,
		ratioH: 22,
		exportWidth: 2550,
		exportHeight: 3300,
		hint: 'US Letter 8.5×11 in @ 300 DPI.'
	},
	{
		id: 'print-letter-landscape',
		label: 'Print',
		menuTitle: 'Letter Landscape',
		ratioW: 22,
		ratioH: 17,
		exportWidth: 3300,
		exportHeight: 2550,
		hint: 'US Letter 11×8.5 in @ 300 DPI.'
	},
	{
		id: 'print-business-card',
		label: 'Print',
		menuTitle: 'Business card',
		ratioW: 7,
		ratioH: 4,
		exportWidth: 1050,
		exportHeight: 600,
		hint: '3.5×2 in @ 300 DPI.'
	},
	{
		id: 'print-poster-18x24',
		label: 'Print',
		menuTitle: 'Poster',
		ratioW: 3,
		ratioH: 4,
		exportWidth: 5400,
		exportHeight: 7200,
		hint: '18×24 in poster @ 300 DPI (common large format).'
	}
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
		presetIds: ['ig-post', 'ig-feed-45', 'ig-story-reel', 'ig-ad', 'ig-landscape']
	},
	{
		id: 'tiktok',
		title: 'TikTok',
		presetIds: ['tt-video', 'tt-carousel-square', 'tt-carousel-45', 'tt-horizontal']
	},
	{
		id: 'facebook',
		title: 'Facebook',
		presetIds: ['fb-post-landscape', 'fb-post-square', 'fb-cover', 'fb-story', 'fb-video-square']
	},
	{
		id: 'youtube',
		title: 'YouTube',
		presetIds: ['yt-thumbnail', 'yt-channel', 'yt-shorts', 'yt-hd']
	},
	{
		id: 'linkedin',
		title: 'LinkedIn',
		presetIds: ['li-share', 'li-banner', 'li-square']
	},
	{
		id: 'x',
		title: 'X',
		presetIds: ['x-post', 'x-header', 'x-image-11']
	},
	{ id: 'pinterest', title: 'Pinterest', presetIds: ['pin-standard'] },
	{ id: 'snapchat', title: 'Snapchat', presetIds: ['sc-story'] },
	{
		id: 'video',
		title: 'Video',
		presetIds: ['video-fhd', 'video-4k', 'video-vertical-hd', 'video-square-hd']
	},
	{
		id: 'print',
		title: 'Print',
		presetIds: [
			'print-invitation-14cm',
			'print-a4-portrait',
			'print-a4-landscape',
			'print-a3',
			'print-letter-portrait',
			'print-letter-landscape',
			'print-business-card',
			'print-poster-18x24'
		]
	}
] as const;

const PRESET_BY_ID = new Map(ASPECT_RATIO_PRESETS.map((p) => [p.id, p]));

/** Default when no platform context: General tab vertical 9:16 (1080×1920). */
export const DEFAULT_ASPECT_RATIO_ID = '9:16';

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
 * When `providerIdentifier` is set (single selected channel in global mode, or focused/single channel in custom), uses that platform’s first preset; otherwise General {@link DEFAULT_ASPECT_RATIO_ID}.
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
