import { DASHBOARD_OPEN_ADD_CHANNEL_WINDOW_EVENT } from 'openquok-common';

import { DASHBOARD_BRIDGE_MESSAGE } from '../../shared/dashboardBridgeMessages.js';

const BRIDGE_AT_KEY = 'openquok:bridge-at';
const BRIDGE_TOKEN_KEY = 'openquok:bridge-access-token';
const BRIDGE_ORG_KEY = 'openquok:bridge-org-id';
/** Min interval between POST /auth/refresh (rotates tokens and can spam the API). */
const MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

function readOrgIdFromMePayload(body: unknown): string | null {
	if (!body || typeof body !== 'object') return null;
	const record = body as Record<string, unknown>;
	const data =
		record.data && typeof record.data === 'object'
			? (record.data as Record<string, unknown>)
			: record;
	const orgId = data.orgId ?? data.organizationId;
	return typeof orgId === 'string' && orgId.trim() ? orgId.trim() : null;
}

function clearLocalBridgeCache(): void {
	try {
		sessionStorage.removeItem(BRIDGE_AT_KEY);
		sessionStorage.removeItem(BRIDGE_TOKEN_KEY);
		sessionStorage.removeItem(BRIDGE_ORG_KEY);
	} catch {
		/* ignore */
	}
}

function notifyExtensionSessionCleared(dashboardOrigin: string): void {
	chrome.runtime.sendMessage({
		type: DASHBOARD_BRIDGE_MESSAGE.CLEAR_SESSION,
		dashboardOrigin,
	});
}

async function fetchOrganizationIdWithSession(dashboardOrigin: string): Promise<string | null> {
	const me = await fetch(`${dashboardOrigin}/api/v1/users/me`, { credentials: 'include' });
	if (!me.ok) return null;
	return readOrgIdFromMePayload(await me.json());
}

async function mintAccessToken(dashboardOrigin: string): Promise<string | null> {
	const refresh = await fetch(`${dashboardOrigin}/api/v1/auth/refresh`, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({}),
	});
	if (!refresh.ok) return null;

	const refreshBody: unknown = await refresh.json();
	const refreshRecord =
		refreshBody && typeof refreshBody === 'object'
			? (refreshBody as Record<string, unknown>)
			: {};
	const refreshData =
		refreshRecord.data && typeof refreshRecord.data === 'object'
			? (refreshRecord.data as Record<string, unknown>)
			: refreshRecord;
	const accessToken =
		typeof refreshData.accessToken === 'string' ? refreshData.accessToken.trim() : '';
	return accessToken || null;
}

function readCachedAccessToken(): string | null {
	try {
		const cached = sessionStorage.getItem(BRIDGE_TOKEN_KEY);
		return cached?.trim() ? cached.trim() : null;
	} catch {
		return null;
	}
}

function cacheBridgeSession(accessToken: string, organizationId: string | null): void {
	try {
		sessionStorage.setItem(BRIDGE_AT_KEY, String(Date.now()));
		sessionStorage.setItem(BRIDGE_TOKEN_KEY, accessToken);
		if (organizationId) sessionStorage.setItem(BRIDGE_ORG_KEY, organizationId);
	} catch {
		/* ignore */
	}
}

function shouldMintFreshAccessToken(): boolean {
	try {
		const last = Number(sessionStorage.getItem(BRIDGE_AT_KEY) || '0');
		return Date.now() - last >= MIN_REFRESH_INTERVAL_MS;
	} catch {
		return true;
	}
}

function shouldSkipDashboardSessionSync(): boolean {
	const path = window.location.pathname.replace(/\/+$/, '') || '/';
	return (
		path.endsWith('/sign-in') ||
		path.endsWith('/sign-up') ||
		path.includes('/verify-signup') ||
		path.includes('/reset-password')
	);
}

async function syncDashboardSessionToExtension(): Promise<void> {
	if (shouldSkipDashboardSessionSync()) return;

	const dashboardOrigin = window.location.origin;
	try {
		const me = await fetch(`${dashboardOrigin}/api/v1/users/me`, { credentials: 'include' });
		if (!me.ok) {
			clearLocalBridgeCache();
			notifyExtensionSessionCleared(dashboardOrigin);
			return;
		}

		let organizationId = readOrgIdFromMePayload(await me.json());
		if (!organizationId) {
			organizationId = await fetchOrganizationIdWithSession(dashboardOrigin);
		}
		if (!organizationId) {
			try {
				const cachedOrg = sessionStorage.getItem(BRIDGE_ORG_KEY);
				if (cachedOrg?.trim()) organizationId = cachedOrg.trim();
			} catch {
				/* ignore */
			}
		}

		let accessToken = readCachedAccessToken();
		if (!accessToken || shouldMintFreshAccessToken()) {
			const minted = await mintAccessToken(dashboardOrigin);
			if (minted) {
				accessToken = minted;
				cacheBridgeSession(accessToken, organizationId);
			}
		}

		if (!accessToken) {
			clearLocalBridgeCache();
			notifyExtensionSessionCleared(dashboardOrigin);
			return;
		}

		chrome.runtime.sendMessage({
			type: DASHBOARD_BRIDGE_MESSAGE.SYNC_FROM_PAGE,
			dashboardOrigin,
			accessToken,
			organizationId,
		});
	} catch {
		/* dashboard tab may be mid-navigation */
	}
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight = false;

function scheduleSync(): void {
	if (syncTimer) clearTimeout(syncTimer);
	syncTimer = setTimeout(() => {
		syncTimer = null;
		if (syncInFlight) return;
		syncInFlight = true;
		void syncDashboardSessionToExtension().finally(() => {
			syncInFlight = false;
		});
	}, 800);
}

void syncDashboardSessionToExtension();

document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'visible') scheduleSync();
});

chrome.runtime.onMessage.addListener((message) => {
	if (!message || typeof message !== 'object') return;
	const record = message as Record<string, unknown>;
	if (record.type === DASHBOARD_BRIDGE_MESSAGE.REQUEST_SYNC) {
		scheduleSync();
		return;
	}
	if (record.type === DASHBOARD_BRIDGE_MESSAGE.OPEN_ADD_CHANNEL_PICKER) {
		window.dispatchEvent(new CustomEvent(DASHBOARD_OPEN_ADD_CHANNEL_WINDOW_EVENT));
	}
});
