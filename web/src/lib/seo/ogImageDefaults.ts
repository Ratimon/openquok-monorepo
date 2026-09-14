import type { MetaDataImage } from '$lib/seo/createMetaData';

export const DEFAULT_OG_IMAGE_MIME = 'image/png';

/**
 * Default Open Graph images for marketing pages without a page-specific hero.
 *
 * Order matters: crawlers use the first `og:image` (Facebook, LinkedIn, iMessage).
 * Additional sizes let platforms pick a better fit without re-cropping the primary.
 *
 * Files live in `web/static/og/`:
 * - `og_1200x630.png` — Meta / Facebook link previews (1.91:1). Keep headline inside center 630×630 for comment thumbnails.
 * - `og_1080x1080.png` — Square (Instagram DMs, some Messenger / WhatsApp previews).
 * - `og_1600x900.png` — Wider 16:9 (Slack, Discord, some X / Twitter contexts).
 */
export const DEFAULT_OG_IMAGE_SPECS = [
	{
		path: '/og/og_1200x630.png',
		width: 1200,
		height: 630,
		altSuffix: 'social preview'
	},
	{
		path: '/og/og_1080x1080.png',
		width: 1080,
		height: 1080,
		altSuffix: 'square social preview'
	},
	{
		path: '/og/og_1600x900.png',
		width: 1600,
		height: 900,
		altSuffix: 'wide social preview'
	}
] as const;

export const DEFAULT_OG_IMAGE_PATH = DEFAULT_OG_IMAGE_SPECS[0].path;
export const DEFAULT_OG_IMAGE_WIDTH = DEFAULT_OG_IMAGE_SPECS[0].width;
export const DEFAULT_OG_IMAGE_HEIGHT = DEFAULT_OG_IMAGE_SPECS[0].height;

export function buildDefaultOgImages(baseUrl: string, companyName: string): MetaDataImage[] {
	return DEFAULT_OG_IMAGE_SPECS.map((spec) => ({
		url: `${baseUrl}${spec.path}`,
		type: DEFAULT_OG_IMAGE_MIME,
		alt: `${companyName} — ${spec.altSuffix}`,
		width: spec.width,
		height: spec.height
	}));
}

/** Primary OG image — first entry in {@link buildDefaultOgImages}. */
export function buildDefaultOgImage(baseUrl: string, companyName: string): MetaDataImage {
	return buildDefaultOgImages(baseUrl, companyName)[0];
}
