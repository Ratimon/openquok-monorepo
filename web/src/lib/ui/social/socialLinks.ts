import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

/** Marketing config keys for public social profile URLs. */
export type SocialLinkChannelId =
	| 'SOCIAL_LINKS_FACEBOOK'
	| 'SOCIAL_LINKS_X'
	| 'SOCIAL_LINKS_INSTAGRAM'
	| 'SOCIAL_LINKS_LINKEDIN'
	| 'SOCIAL_LINKS_YOUTUBE';

export type SocialProfileLink = {
	CHANNEL_ID: SocialLinkChannelId;
	CHANNEL_NAME: string;
	/** Default profile URL when marketing config is empty. */
	CHANNEL_HREF: string;
	Icon: IconName;
	/** When false, omitted from footer follow bar (still eligible for schema `sameAs` if configured). */
	showInFollowBar?: boolean;
};

/**
 * Canonical OpenQuok social profiles — shared by footer UI and Organization JSON-LD `sameAs`.
 * @see https://schema.org/sameAs
 */
export const SOCIAL_PROFILE_LINKS: readonly SocialProfileLink[] = [
	{
		CHANNEL_ID: 'SOCIAL_LINKS_FACEBOOK',
		CHANNEL_NAME: 'Facebook',
		CHANNEL_HREF: 'https://www.facebook.com/profile.php?id=61591368794883',
		Icon: icons.Facebook.name
	},
	{
		CHANNEL_ID: 'SOCIAL_LINKS_X',
		CHANNEL_NAME: 'X',
		CHANNEL_HREF: 'https://x.com/openquok',
		Icon: icons.X.name
	},
	{
		CHANNEL_ID: 'SOCIAL_LINKS_INSTAGRAM',
		CHANNEL_NAME: 'Instagram',
		CHANNEL_HREF: 'https://www.instagram.com/openquok',
		Icon: icons.Instagram.name
	},
	{
		CHANNEL_ID: 'SOCIAL_LINKS_LINKEDIN',
		CHANNEL_NAME: 'LinkedIn',
		CHANNEL_HREF: 'https://www.linkedin.com/company/openquok',
		Icon: icons.LinkedIn.name
	},
	{
		CHANNEL_ID: 'SOCIAL_LINKS_YOUTUBE',
		CHANNEL_NAME: 'YouTube',
		CHANNEL_HREF: '',
		Icon: icons.YouTube.name,
		showInFollowBar: false
	}
];

export const SOCIAL_FOLLOW_BAR_LINKS = SOCIAL_PROFILE_LINKS.filter(
	(link) => link.showInFollowBar !== false
);

/**
 * Resolve profile URLs for schema.org Organization `sameAs` (non-empty only).
 * Prefers marketing config; falls back to {@link SOCIAL_PROFILE_LINKS} defaults.
 */
export function resolveSocialSameAsUrls(
	marketingInformationVm: Record<string, string> = {}
): string[] {
	const urls: string[] = [];
	for (const link of SOCIAL_PROFILE_LINKS) {
		const raw = marketingInformationVm[link.CHANNEL_ID];
		const href =
			typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : link.CHANNEL_HREF.trim();
		if (href) {
			urls.push(href);
		}
	}
	return urls;
}
