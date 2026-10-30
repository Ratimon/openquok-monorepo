import {
	listAuthApiOriginsForDashboard,
	listAuthCheckOrigins,
	listAuthCheckOriginsForDashboard,
	rememberAuthApiOrigin,
} from './dashboardApiOrigin.js';
import { syncDashboardOriginFromActiveTab } from './dashboardActiveTab.js';
import { listDashboardOriginCandidates } from './dashboardOriginStorage.js';
import {
	clearPausedSocialDashboardOrigin,
	listPausedSocialDashboardOrigins,
} from './dashboardSocialDisconnect.js';
import { clearExtensionDashboardSessions } from './clearExtensionDashboardSession.js';
import { findDashboardBridgeSession } from './dashboardBridgeStorage.js';
import {
	cacheMintedAccessToken,
	readCachedMintedAccessToken,
} from './dashboardMintedAccessTokenCache.js';
import { preferHttpsLocalDevSignInUrl } from './openDashboardUrl.js';

function normalizeDashboardUrl(origin: string): string {
	return origin.replace(/\/+$/, '');
}

function apiRoot(origin: string): string {
	return `${normalizeDashboardUrl(origin)}/api/v1`;
}

async function readCookiesForOrigin(origin: string): Promise<chrome.cookies.Cookie[]> {
	const normalized = normalizeDashboardUrl(origin);
	const byUrl = await chrome.cookies.getAll({ url: normalized });
	const sessionOnUrl = byUrl.some(
		(cookie) =>
			(cookie.name === 'refreshToken' || cookie.name === 'access_token') && Boolean(cookie.value)
	);
	if (sessionOnUrl) return byUrl;

	try {
		const host = new URL(normalized).hostname;
		if (host === 'localhost' || host === '127.0.0.1') {
			const byDomain = await chrome.cookies.getAll({ domain: host });
			const sessionOnDomain = byDomain.filter(
				(cookie) =>
					(cookie.name === 'refreshToken' || cookie.name === 'access_token') && Boolean(cookie.value)
			);
			if (sessionOnDomain.length > 0) return [...byUrl, ...sessionOnDomain];
		}
	} catch {
		/* ignore */
	}
	return byUrl;
}

/** After sign-in, cookies return but a prior Disconnect may still pause this origin. */
async function clearPauseWhenSessionCookiesPresent(cookieOrigin: string): Promise<string | null> {
	const cookies = await readCookiesForOrigin(cookieOrigin);
	const hasSession = cookies.some(
		(cookie) =>
			(cookie.name === 'refreshToken' || cookie.name === 'access_token') && Boolean(cookie.value)
	);
	if (!hasSession) return null;
	const dashboardOrigin = dashboardOriginForAuthCookie(cookieOrigin);
	await clearPausedSocialDashboardOrigin(dashboardOrigin);
	return dashboardOrigin;
}

/** Dashboard origin that owns session cookies (never a stale remembered host). */
function dashboardOriginForAuthCookie(cookieOrigin: string): string {
	if (cookieOrigin.includes('://api.')) {
		return cookieOrigin.replace('://api.', '://www.');
	}
	return normalizeDashboardUrl(cookieOrigin);
}

/** True when an origin has an OpenQuok session cookie (httpOnly refresh or legacy access_token). */
export async function hasDashboardSessionCookie(origin: string): Promise<boolean> {
	const cookies = await readCookiesForOrigin(origin);
	return cookies.some(
		(cookie) =>
			(cookie.name === 'refreshToken' || cookie.name === 'access_token') && Boolean(cookie.value)
	);
}

type MintAccessTokenResult =
	| { ok: true; accessToken: string }
	| { ok: false; error: string };

function apiErrorMessage(body: unknown, fallback: string): string {
	const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
	const message =
		(typeof record.message === 'string' && record.message) ||
		(typeof record.error === 'string' && record.error);
	return message || fallback;
}

/**
 * Mint a bearer access token via `POST /auth/refresh` (same path the dashboard uses).
 * Does not call verify-refresh — DB-only verify can reject tokens that still refresh via Supabase.
 */
async function mintAccessTokenFromRefreshToken(
	dashboardOrigin: string,
	refreshToken: string
): Promise<MintAccessTokenResult> {
	const apiOrigins = await listAuthApiOriginsForDashboard(dashboardOrigin);
	let lastError = 'Could not read your session. Try signing in again on the dashboard.';

	for (const apiOrigin of apiOrigins) {
		const url = `${apiRoot(apiOrigin)}/auth/refresh`;
		let response: Response;
		try {
			response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'omit',
				body: JSON.stringify({ refreshToken }),
			});
		} catch {
			lastError = 'Could not reach the OpenQuok API. Is the backend running on port 3000?';
			continue;
		}

		let body: unknown = null;
		try {
			body = await response.json();
		} catch {
			body = null;
		}

		if (response.status === 401 || response.status === 403) {
			return {
				ok: false,
				error: apiErrorMessage(body, 'Session expired. Sign in on the dashboard again.'),
			};
		}
		if (!response.ok) {
			lastError = apiErrorMessage(body, `Session refresh failed (${response.status}).`);
			continue;
		}

		const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
		const data =
			record.data && typeof record.data === 'object'
				? (record.data as Record<string, unknown>)
				: record;
		const accessToken = typeof data.accessToken === 'string' ? data.accessToken : null;
		if (accessToken?.trim()) {
			await rememberAuthApiOrigin(apiOrigin);
			return { ok: true, accessToken };
		}
	}

	return { ok: false, error: lastError };
}

export async function readAccessTokenCookie(
	dashboardOrigin: string
): Promise<{ accessToken: string } | { error: string } | null> {
	const originCandidates = listAuthCheckOriginsForDashboard(dashboardOrigin);

	for (const origin of originCandidates) {
		const cookies = await readCookiesForOrigin(origin);
		const accessToken = cookies.find((cookie) => cookie.name === 'access_token' && cookie.value)?.value;
		if (accessToken) return { accessToken };

		const refreshToken = cookies.find((cookie) => cookie.name === 'refreshToken' && cookie.value)?.value;
		if (!refreshToken) continue;

		const minted = await mintAccessTokenFromRefreshToken(dashboardOrigin, refreshToken);
		if (minted.ok) {
			await cacheMintedAccessToken(dashboardOrigin, minted.accessToken);
			return { accessToken: minted.accessToken };
		}
		return { error: minted.error };
	}

	const bridge = await findDashboardBridgeSession(originCandidates);
	if (bridge?.accessToken) {
		return { accessToken: bridge.accessToken };
	}

	const cached = await readCachedMintedAccessToken(dashboardOrigin);
	if (cached) return { accessToken: cached };

	return null;
}

export function dashboardSignInUrl(origin: string): string {
	return preferHttpsLocalDevSignInUrl(`${normalizeDashboardUrl(origin)}/sign-in`);
}

/**
 * Logged-in when a dashboard session cookie is present (`access_token` or httpOnly `refreshToken`).
 * Access tokens for API calls are minted separately via `/auth/refresh`.
 */
export async function isDashboardLoggedIn(): Promise<{
	loggedIn: boolean;
	loginUrl: string;
}> {
	await syncDashboardOriginFromActiveTab();

	const [checkOrigins, dashboardCandidates] = await Promise.all([
		listAuthCheckOrigins(),
		listDashboardOriginCandidates(),
	]);
	let fallbackOrigin = dashboardCandidates[0] ?? 'https://www.openquok.com';
	const pausedOrigins = await listPausedSocialDashboardOrigins();

	for (const origin of checkOrigins) {
		const unpaused = await clearPauseWhenSessionCookiesPresent(origin);
		const dashboardOrigin = dashboardOriginForAuthCookie(origin);
		if (unpaused) pausedOrigins.delete(unpaused);
		if (pausedOrigins.has(dashboardOrigin)) continue;

		const cookies = await readCookiesForOrigin(origin);
		const accessToken = cookies.find((cookie) => cookie.name === 'access_token' && cookie.value)?.value;
		if (accessToken) {
			return {
				loggedIn: true,
				loginUrl: dashboardSignInUrl(dashboardOrigin),
			};
		}

		const refreshToken = cookies.find((cookie) => cookie.name === 'refreshToken' && cookie.value)?.value;
		if (!refreshToken) continue;

		return {
			loggedIn: true,
			loginUrl: dashboardSignInUrl(dashboardOrigin),
		};
	}

	await clearExtensionDashboardSessions([...checkOrigins, ...dashboardCandidates]);

	for (const origin of dashboardCandidates) {
		fallbackOrigin = origin;
	}

	return { loggedIn: false, loginUrl: dashboardSignInUrl(fallbackOrigin) };
}
