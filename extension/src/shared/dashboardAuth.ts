import {
	listAuthApiOriginsForDashboard,
	listAuthCheckOrigins,
	listAuthCheckOriginsForDashboard,
	rememberAuthApiOrigin,
} from './dashboardApiOrigin.js';
import { syncDashboardOriginFromActiveTab } from './dashboardActiveTab.js';
import { listDashboardOriginCandidates } from './dashboardOriginStorage.js';
import { preferHttpsLocalDevSignInUrl } from './openDashboardUrl.js';

function normalizeDashboardUrl(origin: string): string {
	return origin.replace(/\/+$/, '');
}

function apiRoot(origin: string): string {
	return `${normalizeDashboardUrl(origin)}/api/v1`;
}

async function readCookiesForOrigin(origin: string): Promise<chrome.cookies.Cookie[]> {
	return chrome.cookies.getAll({ url: normalizeDashboardUrl(origin) });
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

async function postVerifyRefresh(
	apiOrigin: string,
	refreshToken: string
): Promise<'ok' | 'invalid' | 'retry'> {
	const url = `${apiRoot(apiOrigin)}/auth/verify-refresh`;
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'omit',
			body: JSON.stringify({ refreshToken }),
		});
		if (response.ok) return 'ok';
		if (response.status === 401 || response.status === 403) return 'invalid';
		if (response.status === 404) return 'retry';
		return 'retry';
	} catch {
		return 'retry';
	}
}

/**
 * Confirms refresh session: prefers `/auth/verify-refresh` (no rotation).
 * When that route is missing (404 on all hosts), falls back to `/auth/refresh` mint.
 */
async function confirmDashboardRefreshSession(
	cookieOrigin: string,
	refreshToken: string,
	dashboardCandidates: string[]
): Promise<boolean> {
	const dashboardForApi =
		dashboardCandidates.find((candidate) => candidate === cookieOrigin) ??
		dashboardCandidates[0] ??
		cookieOrigin;
	const apiOrigins = await listAuthApiOriginsForDashboard(dashboardForApi);

	let verifyUnavailable = false;

	for (const apiOrigin of apiOrigins) {
		const result = await postVerifyRefresh(apiOrigin, refreshToken);
		if (result === 'ok') {
			await rememberAuthApiOrigin(apiOrigin);
			return true;
		}
		if (result === 'invalid') return false;
		verifyUnavailable = true;
	}

	if (!verifyUnavailable) return false;

	const minted = await mintAccessTokenFromRefreshToken(dashboardForApi, refreshToken);
	return Boolean(minted);
}

async function mintAccessTokenFromRefreshToken(
	dashboardOrigin: string,
	refreshToken: string
): Promise<string | null> {
	const apiOrigins = await listAuthApiOriginsForDashboard(dashboardOrigin);

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
			continue;
		}

		let body: unknown = null;
		try {
			body = await response.json();
		} catch {
			body = null;
		}

		if (response.status === 401 || response.status === 403) return null;
		if (!response.ok) continue;

		const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
		const data =
			record.data && typeof record.data === 'object'
				? (record.data as Record<string, unknown>)
				: record;
		const accessToken = typeof data.accessToken === 'string' ? data.accessToken : null;
		if (accessToken?.trim()) {
			await rememberAuthApiOrigin(apiOrigin);
			return accessToken;
		}
	}

	return null;
}

export async function readAccessTokenCookie(dashboardOrigin: string): Promise<string | null> {
	const origins = listAuthCheckOriginsForDashboard(dashboardOrigin);
	const dashboardCandidates = await listDashboardOriginCandidates();

	for (const origin of origins) {
		const cookies = await readCookiesForOrigin(origin);
		const accessToken = cookies.find((cookie) => cookie.name === 'access_token' && cookie.value)?.value;
		if (accessToken) return accessToken;

		const refreshToken = cookies.find((cookie) => cookie.name === 'refreshToken' && cookie.value)?.value;
		if (!refreshToken) continue;

		const valid = await confirmDashboardRefreshSession(origin, refreshToken, dashboardCandidates);
		if (!valid) continue;

		const minted = await mintAccessTokenFromRefreshToken(dashboardOrigin, refreshToken);
		if (minted) return minted;
	}

	return null;
}

export function dashboardSignInUrl(origin: string): string {
	return preferHttpsLocalDevSignInUrl(`${normalizeDashboardUrl(origin)}/sign-in`);
}

/**
 * Logged-in when `access_token` is present, or `refreshToken` passes verify-refresh
 * (or `/auth/refresh` when verify-refresh is not deployed yet).
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

	for (const origin of checkOrigins) {
		const cookies = await readCookiesForOrigin(origin);
		const accessToken = cookies.find((cookie) => cookie.name === 'access_token' && cookie.value)?.value;
		if (accessToken) {
			return {
				loggedIn: true,
				loginUrl: dashboardSignInUrl(dashboardOriginForAuthCookie(origin)),
			};
		}

		const refreshToken = cookies.find((cookie) => cookie.name === 'refreshToken' && cookie.value)?.value;
		if (!refreshToken) continue;

		const valid = await confirmDashboardRefreshSession(origin, refreshToken, dashboardCandidates);
		if (!valid) continue;

		return {
			loggedIn: true,
			loginUrl: dashboardSignInUrl(dashboardOriginForAuthCookie(origin)),
		};
	}

	for (const origin of dashboardCandidates) {
		fallbackOrigin = origin;
	}

	return { loggedIn: false, loginUrl: dashboardSignInUrl(fallbackOrigin) };
}
