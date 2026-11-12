/** Canonical slug shape for `profile_data.slug` (directories and forms). */
export const BUSINESS_PROFILE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Strip leading/trailing hyphens and collapse repeats after `stringToSlug`-style input. */
export function normalizeBusinessProfileSlug(raw: string): string {
	return raw
		.trim()
		.toLowerCase()
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 120);
}

export function isValidBusinessProfileSlug(slug: string): boolean {
	return BUSINESS_PROFILE_SLUG_PATTERN.test(slug);
}
