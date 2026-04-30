/** Public web path for OAuth return (matches SvelteKit `(public)/integration/oauth/[provider]`). */
export function oauthFrontendSocialCallbackPath(provider: string): string {
	return `/integration/oauth/${encodeURIComponent(provider)}`;
}
