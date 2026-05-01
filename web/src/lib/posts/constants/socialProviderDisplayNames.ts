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
	x: 'X'
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
