/** True when the user has a persisted public.users.username (not an email fallback). */
export function hasPublicUsername(username: string | null | undefined): boolean {
	return !!username?.trim();
}
