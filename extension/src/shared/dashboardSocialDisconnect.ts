import {
	LAST_AUTH_API_ORIGIN_KEY,
	LAST_API_ORIGIN_KEY,
	listAuthCheckOriginsForDashboard,
	resolveApiOriginForDashboard,
} from './dashboardApiOrigin.js';
import { hasDashboardSessionCookie } from './dashboardAuth.js';
import { clearExtensionDashboardSession } from './clearExtensionDashboardSession.js';
import { LAST_DASHBOARD_ORIGIN_KEY } from './dashboardOriginStorage.js';

const PAUSED_SOCIAL_ORIGINS_KEY = 'openquok:social-paused-origins';

const SESSION_COOKIE_NAMES = ['refreshToken', 'access_token', 'showorg'] as const;

function normalizeOrigin(origin: string): string | null {
	try {
		return new URL(origin.trim()).origin;
	} catch {
		return null;
	}
}

export async function listPausedSocialDashboardOrigins(): Promise<Set<string>> {
	if (typeof chrome === 'undefined' || !chrome.storage?.local) return new Set();
	const stored = await chrome.storage.local.get(PAUSED_SOCIAL_ORIGINS_KEY);
	const raw = stored[PAUSED_SOCIAL_ORIGINS_KEY];
	if (!Array.isArray(raw)) return new Set();
	const origins = raw.filter((value): value is string => typeof value === 'string');
	return new Set(origins.map((o) => normalizeOrigin(o)).filter(Boolean) as string[]);
}

export async function clearPausedSocialDashboardOrigin(origin: string): Promise<void> {
	const normalized = normalizeOrigin(origin);
	if (!normalized || !chrome.storage?.local) return;
	const paused = await listPausedSocialDashboardOrigins();
	if (!paused.has(normalized)) return;
	paused.delete(normalized);
	await chrome.storage.local.set({ [PAUSED_SOCIAL_ORIGINS_KEY]: [...paused] });
}

async function pauseSocialDashboardOrigin(origin: string): Promise<void> {
	const normalized = normalizeOrigin(origin);
	if (!normalized || !chrome.storage?.local) return;
	const paused = await listPausedSocialDashboardOrigins();
	paused.add(normalized);
	await chrome.storage.local.set({ [PAUSED_SOCIAL_ORIGINS_KEY]: [...paused] });
}

/**
 * Clears extension session cache and pauses auto-reconnect for this dashboard origin
 * without signing the user out in the browser or on the API.
 */
export async function detachSocialDashboardExtension(dashboardOrigin: string): Promise<void> {
	const normalized = normalizeOrigin(dashboardOrigin);
	if (!normalized) return;
	await clearExtensionDashboardSession(normalized);
	await pauseSocialDashboardOrigin(normalized);
}

async function readRefreshTokenForOrigin(dashboardOrigin: string): Promise<string | null> {
	for (const origin of listAuthCheckOriginsForDashboard(dashboardOrigin)) {
		const cookies = await chrome.cookies.getAll({ url: origin });
		const refresh = cookies.find((c) => c.name === 'refreshToken' && c.value)?.value;
		if (refresh) return refresh;
	}
	return null;
}

async function clearSessionCookiesForDashboard(dashboardOrigin: string): Promise<void> {
	for (const origin of listAuthCheckOriginsForDashboard(dashboardOrigin)) {
		const cookies = await chrome.cookies.getAll({ url: origin });
		for (const cookie of cookies) {
			if ((SESSION_COOKIE_NAMES as readonly string[]).includes(cookie.name)) {
				await chrome.cookies.remove({ url: origin, name: cookie.name });
			}
		}
	}
}

/**
 * Signs out on the API (best effort), clears dashboard session cookies, and pauses extension
 * auto-reconnect for this origin until the user connects again from the gate.
 */
export async function disconnectSocialDashboardSession(input: {
	dashboardOrigin: string;
	apiOrigin: string;
	accessToken: string;
}): Promise<void> {
	const dashboardOrigin = normalizeOrigin(input.dashboardOrigin);
	if (!dashboardOrigin) return;

	const apiOrigin = await resolveApiOriginForDashboard(dashboardOrigin);
	const refreshToken = await readRefreshTokenForOrigin(dashboardOrigin);
	const hasBrowserSession = await hasDashboardSessionCookie(dashboardOrigin);

	// Skip API sign-out when the dashboard already signed out (avoids duplicate "User signed out" logs).
	if (hasBrowserSession && (refreshToken || input.accessToken.trim())) {
		try {
			await fetch(`${apiOrigin.replace(/\/+$/, '')}/api/v1/auth/sign-out`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${input.accessToken}`,
				},
				credentials: 'omit',
				body: JSON.stringify(refreshToken ? { refreshToken } : {}),
			});
		} catch {
			/* still clear local session */
		}
	}

	await clearSessionCookiesForDashboard(dashboardOrigin);
	await clearExtensionDashboardSession(dashboardOrigin);
	await pauseSocialDashboardOrigin(dashboardOrigin);

	const remembered = await chrome.storage.local.get([
		LAST_DASHBOARD_ORIGIN_KEY,
		LAST_API_ORIGIN_KEY,
		LAST_AUTH_API_ORIGIN_KEY,
	]);
	if (remembered[LAST_DASHBOARD_ORIGIN_KEY] === dashboardOrigin) {
		await chrome.storage.local.remove(LAST_DASHBOARD_ORIGIN_KEY);
	}
}
