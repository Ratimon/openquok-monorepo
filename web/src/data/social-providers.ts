import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

/** Provider identifiers treated as analytics-capable on the account home */
export const SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS = [
	'facebook',
	'instagram',
	'instagram-standalone',
	'linkedin',
	'linkedin-page',
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
	linkedin: 'LinkedIn',
	'linkedin-page': 'LinkedIn Page'
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
		linkedin: '[in]',
		'linkedin-page': '[in]'
	};
	return byId[key] ?? '🔗';
}

type SocialProviderIconSpec = {
	/** Integration catalog identifiers that share this icon set. */
	identifiers?: readonly string[];
	/** Default icon for in-app surfaces (composer, calendar, channels). */
	icon: IconName;
	/** Fixed-color mark for human-facing lists on tinted panels (compare rows). */
	listIcon?: IconName;
	/** Human-readable labels that resolve to this platform. */
	labels: readonly string[];
};

/** Canonical social platform icon catalog — drives identifier and label lookups. */
const SOCIAL_PROVIDER_ICON_SPECS: readonly SocialProviderIconSpec[] = [
	{
		identifiers: ['facebook'],
		icon: icons.FacebookGlyph.name,
		labels: ['Facebook', 'Facebook Page']
	},
	{
		identifiers: ['instagram'],
		icon: icons.InstagramGlyph.name,
		labels: ['Instagram']
	},
	{
		identifiers: ['instagram-business'],
		icon: icons.Instagram.name,
		labels: ['Instagram (Business)']
	},
	{
		identifiers: ['instagram-standalone'],
		icon: icons.InstagramGlyph.name,
		labels: ['Instagram (Standalone)']
	},
	{
		identifiers: ['youtube'],
		icon: icons.YouTubeGlyph.name,
		labels: ['YouTube']
	},
	{
		identifiers: ['tiktok'],
		icon: icons.TikTok.name,
		labels: ['TikTok']
	},
	{
		identifiers: ['x'],
		icon: icons.X.name,
		listIcon: icons.XGlyph.name,
		labels: ['X']
	},
	{
		identifiers: ['threads'],
		icon: icons.Threads.name,
		listIcon: icons.ThreadsGlyph.name,
		labels: ['Threads']
	},
	{
		identifiers: ['linkedin', 'linkedin-page'],
		icon: icons.LinkedIn.name,
		labels: ['LinkedIn', 'LinkedIn Page']
	},
	{
		icon: icons.Bluesky.name,
		labels: ['Bluesky']
	},
	{
		icon: icons.Pinterest.name,
		labels: ['Pinterest']
	},
	{
		icon: icons.Google.name,
		labels: ['Google Business Profile', 'Google Business']
	},
	{
		icon: icons.WhatsApp.name,
		labels: ['WhatsApp']
	}
];

function buildSocialProviderIconByIdentifier(
	specs: readonly SocialProviderIconSpec[]
): Record<string, IconName> {
	const out: Record<string, IconName> = {};
	for (const spec of specs) {
		if (!spec.identifiers) continue;
		for (const identifier of spec.identifiers) {
			out[identifier] = spec.icon;
		}
	}
	return out;
}

function buildSocialProviderIconByLabel(
	specs: readonly SocialProviderIconSpec[]
): Record<string, IconName> {
	const out: Record<string, IconName> = {};
	for (const spec of specs) {
		const listIcon = spec.listIcon ?? spec.icon;
		for (const label of spec.labels) {
			out[label] = listIcon;
		}
	}
	return out;
}

const socialProviderIconByLabel = buildSocialProviderIconByLabel(SOCIAL_PROVIDER_ICON_SPECS);

/** Integration catalog / channel `identifier` → AbstractIcon name. */
export const socialProviderIconByIdentifier = buildSocialProviderIconByIdentifier(
	SOCIAL_PROVIDER_ICON_SPECS
);

export function socialProviderIcon(identifier: string | null | undefined): IconName {
	if (identifier == null || String(identifier).trim() === '') {
		return icons.Link.name;
	}
	const id = String(identifier);
	return socialProviderIconByIdentifier[id] ?? icons.Link.name;
}

/** Human-readable platform label → fixed-color list icon (compare pages, competitor channel lists). */
export function socialPlatformIconForLabel(label: string): IconName | undefined {
	return socialProviderIconByLabel[label.trim()];
}
