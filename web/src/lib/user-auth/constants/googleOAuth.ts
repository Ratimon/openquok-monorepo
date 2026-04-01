import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';

/** Backend route: starts Google OAuth (redirect to Supabase / provider). */
export const OAUTH_GOOGLE_PATH = '/api/v1/auth/oauth/google';

/**
 * Build absolute URL for GET /api/v1/auth/oauth/google.
 * `next` must be a safe path for the backend callback (leading `/`, or we derive path from an absolute URL).
 */
export function getGoogleOAuthStartUrl(options?: { next?: string | null }): string {
	let base = String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? '').trim().replace(/\/+$/, '');
	if (!base) base = 'http://localhost:3000';

	const url = new URL(OAUTH_GOOGLE_PATH, `${base}/`);

	const rawNext = options?.next;
	if (rawNext) {
		const safe = normalizeNextForOAuthCallback(rawNext);
		if (safe && safe !== '/') {
			url.searchParams.set('next', safe);
		}
	}

	return url.toString();
}

function normalizeNextForOAuthCallback(raw: string): string {
	const trimmed = raw.trim();
	if (!trimmed) return '/';
	if (trimmed.startsWith('/')) return trimmed;
	try {
		const u = new URL(trimmed);
		const pathAndQuery = `${u.pathname}${u.search}`;
		return pathAndQuery || '/';
	} catch {
		return '/';
	}
}
