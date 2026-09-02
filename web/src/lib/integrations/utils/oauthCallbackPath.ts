import { route } from '$lib/utils/path';

/** Providers whose OAuth app registration requires a trailing slash on the redirect URI. */
const OAUTH_CALLBACK_TRAILING_SLASH_PROVIDERS = new Set(['tiktok-business']);

/** Public SvelteKit route where providers redirect after OAuth (no `(protected)` layout). */
export function integrationOAuthCallbackPath(provider: string): string {
	const slug = provider.trim();
	const base = route(`/integration/oauth/${encodeURIComponent(slug)}`);
	if (OAUTH_CALLBACK_TRAILING_SLASH_PROVIDERS.has(slug)) {
		return base.endsWith('/') ? base : `${base}/`;
	}
	return base;
}

