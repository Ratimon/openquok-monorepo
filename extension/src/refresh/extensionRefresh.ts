import { EXTENSION_REFRESH_PATH } from '../constants.js';
import { encodeCookiesConnectCode, extractCookies } from '../cookies/extractCookies.js';
import { getCookieSessionProvider } from '../providers/provider.registry.js';
import type { StoredRefreshRegistration } from '../storage/refreshTokenStorage.js';

function normalizeBackendUrl(backendUrl: string): string {
	return backendUrl.replace(/\/+$/, '');
}

function apiRoot(backendUrl: string): string {
	return `${normalizeBackendUrl(backendUrl)}/api/v1`;
}

export type ExtensionRefreshResult =
	| { ok: true }
	| { ok: false; error: string; refreshNeeded?: boolean };

/**
 * Re-validates session cookies with the OpenQuok API (periodic extension refresh).
 */
export async function postExtensionRefresh(
	entry: StoredRefreshRegistration
): Promise<ExtensionRefreshResult> {
	const provider = getCookieSessionProvider(entry.providerId);
	if (!provider) {
		return { ok: false, error: `Unknown provider "${entry.providerId}".` };
	}

	let cookies;
	try {
		cookies = await extractCookies(provider);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to read session cookies.';
		return { ok: false, error: message };
	}

	const url = `${apiRoot(entry.backendUrl)}${EXTENSION_REFRESH_PATH}`;
	const code = encodeCookiesConnectCode(cookies);

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${entry.refreshToken}`,
		},
		body: JSON.stringify({ code }),
	});

	let body: unknown = null;
	try {
		body = await response.json();
	} catch {
		body = null;
	}

	if (!response.ok) {
		const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
		const message =
			(typeof record.message === 'string' && record.message) ||
			(typeof record.error === 'string' && record.error) ||
			`Refresh failed (${response.status}).`;
		const refreshNeeded = record.refresh_needed === true || record.refreshNeeded === true;
		return { ok: false, error: message, refreshNeeded };
	}

	return { ok: true };
}
