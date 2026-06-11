import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

/** Provider identifiers treated as analytics-capable on the account home */
export const SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS = [
	'facebook',
	'instagram',
	'instagram-standalone',
	'linkedin',
	'tiktok',
	'youtube',
	'threads',
	'x'
] as const;

export type SupportedAnalyticsProviderIdentifier =
	(typeof SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS)[number];

/**
 * Human-readable labels for integration catalog `identifier` values.
 * Matches backend `SocialProvider.name` where listed; used anywhere the URL or VM only exposes the slug.
 */
export const socialProviderDisplayNameByIdentifier: Record<string, string> = {
	threads: 'Threads',
	'instagram-business': 'Instagram (Business)',
	'instagram-standalone': 'Instagram (Standalone)',
	instagram: 'Instagram',
	facebook: 'Facebook Page',
	youtube: 'YouTube',
	tiktok: 'TikTok',
	x: 'X',
	'linkedin': 'LinkedIn',
};

export function socialProviderDisplayLabel(identifier: string): string {
	const key = identifier.trim();
	if (socialProviderDisplayNameByIdentifier[key]) {
		return socialProviderDisplayNameByIdentifier[key];
	}
	return key
		.split('-')
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(' ');
}

/** Lowercase provider slugs + catalog display names — not profile @handles. */
function socialProviderPlatformLabelSet(): Set<string> {
	const labels = new Set<string>();
	for (const [id, display] of Object.entries(socialProviderDisplayNameByIdentifier)) {
		labels.add(id.toLowerCase());
		labels.add(display.toLowerCase());
	}
	labels.add('generic');
	return labels;
}

const SOCIAL_PROVIDER_PLATFORM_LABELS = socialProviderPlatformLabelSet();

/** True when `name` is a platform slug/label (e.g. `threads`, `Threads`), not a connected profile name. */
export function isSocialProviderPlatformLabel(name: string, identifier?: string): boolean {
	const trimmed = name.trim();
	if (!trimmed) return false;
	const lower = trimmed.toLowerCase();
	if (SOCIAL_PROVIDER_PLATFORM_LABELS.has(lower)) return true;
	const id = identifier?.trim().toLowerCase();
	if (id && lower === id) return true;
	return false;
}

export function isProfileChannelDisplayName(name: string, identifier: string): boolean {
	return !isSocialProviderPlatformLabel(name, identifier);
}

/** Single grapheme for plain-text tooltips / summaries by integration `identifier`. */
export function socialProviderEmoji(identifier: string): string {
	const key = identifier.trim();
	const byId: Record<string, string> = {
		threads: '𓍯',
		instagram: '🅾',
		'instagram-business': '🅾',
		'instagram-standalone': '🅾',
		facebook: 'ⓕ',
		youtube: '▶️',
		tiktok: '🎵',
		x: '𝕏',
		'linkedin': '[in]',
	};
	return byId[key] ?? '🔗';
}

/** Integration catalog / channel `identifier` → AbstractIcon name. Single source for calendar, account, composer, docs overlap. */
export const socialProviderIconByIdentifier: Record<string, IconName> = {
	facebook: icons.FacebookGlyph.name,
	instagram: icons.InstagramGlyph.name,
	'instagram-business': icons.Instagram.name,
	'instagram-standalone': icons.InstagramGlyph.name,
	youtube: icons.YouTubeGlyph.name,
	tiktok: icons.TikTok.name,
	x: icons.X.name,
	threads: icons.Threads.name,
	linkedin: icons.LinkedIn.name
};

export function socialProviderIcon(identifier: string | null | undefined): IconName {
	if (identifier == null || String(identifier).trim() === '') {
		return icons.Link.name;
	}
	const id = String(identifier);
	return socialProviderIconByIdentifier[id] ?? icons.Link.name;
}
