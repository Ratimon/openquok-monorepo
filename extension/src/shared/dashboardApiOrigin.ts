import { listRefreshRegistrations } from '../storage/refreshTokenStorage.js';

import { isLocalDashboardOrigin, listOpenDashboardTabOrigins } from './dashboardActiveTab.js';
import { listDashboardOriginCandidates } from './dashboardOriginStorage.js';

export const LAST_API_ORIGIN_KEY = 'openquok:last-api-origin';
/** API host that last accepted `/auth/verify-refresh` for this extension install. */
export const LAST_AUTH_API_ORIGIN_KEY = 'openquok:last-auth-api-origin';

function hasChromeLocalStorage(): boolean {
	return (
		typeof chrome !== 'undefined' &&
		typeof chrome.storage?.local?.get === 'function'
	);
}

function normalizeOrigin(origin: string): string | null {
	const trimmed = origin.trim();
	if (!trimmed) return null;
	try {
		return new URL(trimmed).origin;
	} catch {
		return null;
	}
}

/**
 * Production ships the SPA on `www.*` and `VITE_API_BASE_URL` on `api.*` (same registrable domain).
 * Local dev proxies `/api` on the Vite origin — no separate API host.
 */
export function deriveApiOriginFromDashboard(dashboardOrigin: string): string | null {
	try {
		const url = new URL(dashboardOrigin);
		const host = url.hostname.toLowerCase();
		if (host === 'localhost' || host === '127.0.0.1') {
			return null;
		}
		if (host.startsWith('www.')) {
			return `${url.protocol}//api.${host.slice(4)}`;
		}
	} catch {
		return null;
	}
	return null;
}

export async function rememberApiOrigin(origin: string): Promise<void> {
	const normalized = normalizeOrigin(origin);
	if (!normalized) return;
	await chrome.storage.local.set({ [LAST_API_ORIGIN_KEY]: normalized });
}

export async function rememberAuthApiOrigin(origin: string): Promise<void> {
	const normalized = normalizeOrigin(origin);
	if (!normalized) return;
	await chrome.storage.local.set({ [LAST_AUTH_API_ORIGIN_KEY]: normalized });
}

/**
 * Ordered API origins for auth calls (`/auth/verify-refresh`, `/auth/refresh`).
 * Dashboard origin first (Vite `/api` proxy + same-origin production); then `api.*` host.
 */
export async function listAuthApiOriginsForDashboard(dashboardOrigin: string): Promise<string[]> {
	const normalized = normalizeOrigin(dashboardOrigin);
	if (!normalized) return ['https://www.openquok.com'];

	const seen = new Set<string>();
	const origins: string[] = [];

	const push = (raw?: string | null): void => {
		if (raw == null) return;
		const origin = normalizeOrigin(raw);
		if (!origin || seen.has(origin)) return;
		seen.add(origin);
		origins.push(origin);
	};

	push(normalized);
	push(deriveApiOriginFromDashboard(normalized));

	// Local dev: mint via the Vite dashboard origin (`/api` proxy). Direct `:3000` calls use
	// `chrome-extension://` as Origin and are rejected by API CORS (harmless but noisy).

	if (hasChromeLocalStorage()) {
		const storage = await chrome.storage.local.get([
			LAST_AUTH_API_ORIGIN_KEY,
			LAST_API_ORIGIN_KEY,
		]);
		push(storage[LAST_AUTH_API_ORIGIN_KEY] as string | undefined);
		push(storage[LAST_API_ORIGIN_KEY] as string | undefined);
	}

	const registrations = hasChromeLocalStorage() ? await listRefreshRegistrations() : [];
	for (const entry of registrations) {
		push(entry.backendUrl);
	}

	return origins;
}

/** API host for `/api/v1/*` given where the user opened the dashboard. */
export async function resolveApiOriginForDashboard(dashboardOrigin: string): Promise<string> {
	const normalized = normalizeOrigin(dashboardOrigin);
	if (!normalized) {
		return 'https://www.openquok.com';
	}

	// Local Vite proxies `/api` on the dashboard origin — do not reuse stored `api.*` hosts.
	if (isLocalDashboardOrigin(normalized)) {
		return normalized;
	}

	if (hasChromeLocalStorage()) {
		const storage = await chrome.storage.local.get(LAST_AUTH_API_ORIGIN_KEY);
		const lastAuth = storage[LAST_AUTH_API_ORIGIN_KEY];
		if (typeof lastAuth === 'string') {
			const authOrigin = normalizeOrigin(lastAuth);
			if (authOrigin) return authOrigin;
		}
	}

	const derived = deriveApiOriginFromDashboard(normalized);
	if (!derived) {
		return normalized;
	}

	if (!hasChromeLocalStorage()) {
		return derived;
	}

	const storage = await chrome.storage.local.get(LAST_API_ORIGIN_KEY);
	const stored = storage[LAST_API_ORIGIN_KEY];
	if (typeof stored === 'string') {
		const storedOrigin = normalizeOrigin(stored);
		if (storedOrigin) return storedOrigin;
	}

	const registrations = await listRefreshRegistrations();
	for (const entry of registrations) {
		const backend = normalizeOrigin(entry.backendUrl);
		if (backend) return backend;
	}

	return derived;
}

/** Origins to scan for `refreshToken` / `access_token` (dashboard hosts only — cookies are not on `api.*`). */
export async function listAuthCheckOrigins(): Promise<string[]> {
	const [dashboardCandidates, openTabOrigins] = await Promise.all([
		listDashboardOriginCandidates(),
		listOpenDashboardTabOrigins(),
	]);

	const seen = new Set<string>();
	const origins: string[] = [];

	const push = (raw?: string | null): void => {
		if (raw == null) return;
		const normalized = normalizeOrigin(raw);
		if (!normalized || seen.has(normalized)) return;
		seen.add(normalized);
		origins.push(normalized);
	};

	for (const dashboard of openTabOrigins) {
		push(dashboard);
	}

	for (const dashboard of dashboardCandidates) {
		push(dashboard);
	}

	// Dev: session may exist on Vite even when production is the remembered dashboard host.
	push('https://localhost:5173');
	push('http://localhost:5173');

	return origins;
}

export function listAuthCheckOriginsForDashboard(dashboardOrigin: string): string[] {
	const seen = new Set<string>();
	const origins: string[] = [];

	const push = (raw?: string | null): void => {
		if (raw == null) return;
		const normalized = normalizeOrigin(raw);
		if (!normalized || seen.has(normalized)) return;
		seen.add(normalized);
		origins.push(normalized);
	};

	push(dashboardOrigin);
	push(deriveApiOriginFromDashboard(dashboardOrigin));

	if (isLocalDashboardOrigin(dashboardOrigin)) {
		try {
			const url = new URL(dashboardOrigin);
			const altProtocol = url.protocol === 'https:' ? 'http:' : 'https:';
			push(`${altProtocol}//${url.host}`);
		} catch {
			/* ignore */
		}
	}

	return origins;
}
