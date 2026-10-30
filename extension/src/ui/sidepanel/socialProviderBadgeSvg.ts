import { BADGE_ICON_FRAGMENTS, type BadgeIconFragment } from './socialProviderBadgeFragments.js';

/** Matches web composer badge size (`AbstractIcon` `size-3.5` → 14px). */
export const SOCIAL_PROVIDER_BADGE_SIZE_PX = 14;

/**
 * Integration catalog `identifier` → web `AbstractIcon` name (`socialProviderIconByIdentifier`).
 * Keep in sync with `web/src/data/social-providers.ts` `SOCIAL_PROVIDER_ICON_SPECS`.
 */
const SOCIAL_PROVIDER_BADGE_ICON_BY_IDENTIFIER: Record<string, string> = {
	facebook: 'FacebookGlyph',
	instagram: 'InstagramGlyph',
	'instagram-business': 'Instagram',
	'instagram-standalone': 'InstagramGlyph',
	youtube: 'YouTubeGlyph',
	tiktok: 'TikTok',
	x: 'X',
	threads: 'Threads',
	linkedin: 'LinkedInGlyph',
	'linkedin-page': 'LinkedInGlyph',
	devto: 'DevtoGlyph',
	bluesky: 'BlueskyGlyph',
	skool: 'SkoolGlyph',
};

const DEFAULT_BADGE_ICON_NAME = 'Link';

let badgeRenderScope = 0;

function scopeSvgFragmentIds(fragment: string, prefix: string): string {
	const scoped = fragment.replace(/\bid="([^"]+)"/g, `id="${prefix}$1"`);
	return scoped.replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`);
}

function normalizeIdentifier(identifier: string | null | undefined): string {
	return String(identifier ?? '').trim().toLowerCase();
}

/** Resolves the web icon registry name used for a channel identifier. */
export function socialProviderBadgeIconName(identifier: string | null | undefined): string {
	const key = normalizeIdentifier(identifier);
	if (!key) return DEFAULT_BADGE_ICON_NAME;
	return SOCIAL_PROVIDER_BADGE_ICON_BY_IDENTIFIER[key] ?? DEFAULT_BADGE_ICON_NAME;
}

function iconFragmentForName(name: string): BadgeIconFragment {
	return BADGE_ICON_FRAGMENTS[name] ?? BADGE_ICON_FRAGMENTS[DEFAULT_BADGE_ICON_NAME];
}

/**
 * Returns a complete inline `<svg>` string for the provider badge on channel avatars.
 * Safe for `innerHTML` on a badge wrapper (unique gradient/mask ids per call).
 */
export function getSocialProviderBadgeSvg(
	identifier: string | null | undefined,
	sizePx: number = SOCIAL_PROVIDER_BADGE_SIZE_PX
): string {
	const iconName = socialProviderBadgeIconName(identifier);
	const meta = iconFragmentForName(iconName);
	const scope = `spb_${badgeRenderScope++}_`;
	const scopedFragment = scopeSvgFragmentIds(meta.fragment, `${meta.name}${scope}`);
	const viewHeight = meta.boxHeight ?? meta.box;
	const viewBox = `0 0 ${meta.box} ${viewHeight}`;
	const fillAttr = meta.fill ? 'currentColor' : 'none';
	const strokeAttr = meta.fill ? 'none' : 'currentColor';
	const strokeWidth = meta.fill ? '' : ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
	const preserve = meta.fill ? ' preserveAspectRatio="xMidYMid meet"' : '';

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="${viewBox}" fill="${fillAttr}" stroke="${strokeAttr}"${strokeWidth} aria-hidden="true" focusable="false"${preserve}>${scopedFragment}</svg>`;
}
