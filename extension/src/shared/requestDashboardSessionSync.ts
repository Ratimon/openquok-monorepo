import { DASHBOARD_BRIDGE_MESSAGE } from './dashboardBridgeMessages.js';

const DASHBOARD_TAB_URL_PATTERNS = [
	'https://localhost:*/*',
	'http://localhost:*/*',
	'https://127.0.0.1:*/*',
	'http://127.0.0.1:*/*',
	'https://*.openquok.com/*',
];

/** Ask open dashboard tabs to POST /auth/refresh (cookie auth) and push session to the extension. */
export async function requestDashboardSessionSyncFromOpenTabs(): Promise<void> {
	if (typeof chrome === 'undefined' || typeof chrome.tabs?.query !== 'function') return;

	const tabs = await chrome.tabs.query({ url: DASHBOARD_TAB_URL_PATTERNS });
	for (const tab of tabs) {
		if (!tab.id) continue;
		try {
			await chrome.tabs.sendMessage(tab.id, { type: DASHBOARD_BRIDGE_MESSAGE.REQUEST_SYNC });
		} catch {
			/* tab may not have the content script yet */
		}
	}
}

export function waitMs(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
