import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

/** Provider identifiers treated as analytics-capable in the dashboard */
export const SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS = [
	'facebook',
	'instagram',
	'instagram-standalone',
	'linkedin-page',
	'tiktok',
	'youtube',
	'gmb',
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
	facebook: 'Facebook',
	youtube: 'YouTube',
	tiktok: 'TikTok',
	x: 'X',
	'linkedin-page': 'LinkedIn',
	gmb: 'Google Business Profile',
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

/** Integration catalog / channel `identifier` → AbstractIcon name. Single source for calendar, account, composer, docs overlap. */
export const socialProviderIconByIdentifier: Record<string, IconName> = {
	facebook: icons.Facebook.name,
	instagram: icons.Instagram.name,
	'instagram-business': icons.Instagram.name,
	'instagram-standalone': icons.InstagramGlyph.name,
	youtube: icons.YouTube.name,
	tiktok: icons.TikTok.name,
	x: icons.X.name,
	threads: icons.Threads.name
};

export function socialProviderIcon(identifier: string | null | undefined): IconName {
	if (identifier == null || String(identifier).trim() === '') {
		return icons.Link.name;
	}
	const id = String(identifier);
	return socialProviderIconByIdentifier[id] ?? icons.Link.name;
}
