/** `/channels/{slug}` directory launch slugs — keep aligned with `directory-seeds.ts`. */
export const PUBLIC_DIRECTORY_CHANNEL_SLUGS = ['peerpush', 'uneed', 'open-launch'] as const;

export type PublicDirectoryChannelSlug = (typeof PUBLIC_DIRECTORY_CHANNEL_SLUGS)[number];

export function isPublicDirectoryChannelSlug(slug: string): slug is PublicDirectoryChannelSlug {
	const key = slug.trim().toLowerCase();
	return key.length > 0 && (PUBLIC_DIRECTORY_CHANNEL_SLUGS as readonly string[]).includes(key);
}
