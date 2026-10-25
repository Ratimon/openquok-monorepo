import { rememberDashboardOrigin } from './dashboardOriginStorage.js';

/** Vite dev dashboard (http or https). */
export function isLocalDashboardOrigin(origin: string): boolean {
	try {
		const host = new URL(origin).hostname.toLowerCase();
		return host === 'localhost' || host === '127.0.0.1';
	} catch {
		return false;
	}
}

function isOpenQuokDashboardUrl(url: URL): boolean {
	const host = url.hostname.toLowerCase();
	if (host === 'localhost' || host === '127.0.0.1') {
		return url.port === '5173' || url.port === '';
	}
	return host === 'openquok.com' || host.endsWith('.openquok.com');
}

/**
 * When the user has an OpenQuok dashboard tab focused (e.g. local Vite), pin that origin so
 * Social API calls match the environment they are testing — not a stale production remember.
 */
export async function syncDashboardOriginFromActiveTab(): Promise<string | null> {
	if (typeof chrome === 'undefined' || typeof chrome.tabs?.query !== 'function') {
		return null;
	}

	const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	const rawUrl = tabs[0]?.url;
	if (!rawUrl) return null;

	try {
		const parsed = new URL(rawUrl);
		if (!isOpenQuokDashboardUrl(parsed)) return null;
		const origin = parsed.origin;
		await rememberDashboardOrigin(origin);
		return origin;
	} catch {
		return null;
	}
}
