import { DASHBOARD_OPEN_ADD_CHANNEL_EXTENSION_MESSAGE } from 'openquok-common';

/** Internal extension messages (content script ↔ service worker ↔ side panel). */
export const DASHBOARD_BRIDGE_MESSAGE = {
	/** Dashboard tab finished a cookie-authenticated refresh; carries bearer + org. */
	SYNC_FROM_PAGE: 'OPENQUOK_DASHBOARD_SESSION_SYNC',
	/** Side panel / background asks an open dashboard tab to re-sync. */
	REQUEST_SYNC: 'OPENQUOK_REQUEST_DASHBOARD_SYNC',
	/** Dashboard signed out or session cookies cleared — drop cached extension session. */
	CLEAR_SESSION: 'OPENQUOK_DASHBOARD_SESSION_CLEAR',
	/** Open the Add Channel dialog on an already-loaded `/account` tab (no URL query). */
	OPEN_ADD_CHANNEL_PICKER: DASHBOARD_OPEN_ADD_CHANNEL_EXTENSION_MESSAGE,
} as const;

export type DashboardSessionClearPayload = {
	type: typeof DASHBOARD_BRIDGE_MESSAGE.CLEAR_SESSION;
	dashboardOrigin: string;
};

export function isDashboardSessionClearPayload(value: unknown): value is DashboardSessionClearPayload {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	return (
		record.type === DASHBOARD_BRIDGE_MESSAGE.CLEAR_SESSION &&
		typeof record.dashboardOrigin === 'string'
	);
}

export type DashboardSessionSyncPayload = {
	type: typeof DASHBOARD_BRIDGE_MESSAGE.SYNC_FROM_PAGE;
	dashboardOrigin: string;
	accessToken: string;
	organizationId: string | null;
};

export function isDashboardSessionSyncPayload(value: unknown): value is DashboardSessionSyncPayload {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	return (
		record.type === DASHBOARD_BRIDGE_MESSAGE.SYNC_FROM_PAGE &&
		typeof record.dashboardOrigin === 'string' &&
		typeof record.accessToken === 'string' &&
		(record.organizationId === null || typeof record.organizationId === 'string')
	);
}
