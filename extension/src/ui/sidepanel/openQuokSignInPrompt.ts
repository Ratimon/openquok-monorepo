/** Errors from OpenQuok API / auto-launch when dashboard session is missing. */
export function isOpenQuokSignInMessage(message: string): boolean {
	const normalized = message.trim().toLowerCase();
	return normalized.includes('sign in') && normalized.includes('openquok');
}

export function defaultSignInBannerMessage(): string {
	return 'Sign in to OpenQuok on the dashboard first.';
}