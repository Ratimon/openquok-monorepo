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
	if (host === 'openquok.com' || host.endsWith('.openquok.com')) {
		return true;
	}
	return host === 'openquok.cloud' || host.endsWith('.openquok.cloud');
}

/**
 * When the user has an OpenQuok dashboard tab focused (e.g. local Vite), pin that origin so
 * Social API calls match the environment they are testing — not a stale production remember.
 */
function readDashboardOriginFromUrl(rawUrl: string): string | null {
	try {
		const parsed = new URL(rawUrl);
		if (!isOpenQuokDashboardUrl(parsed)) return null;
		return parsed.origin;
	} catch {
		return null;
	}
}

/** Origins of every open OpenQuok dashboard tab (side panel may not be the active tab). */
export async function listOpenDashboardTabOrigins(): Promise<string[]> {
	if (typeof chrome === 'undefined' || typeof chrome.tabs?.query !== 'function') {
		return [];
	}

	const tabs = await chrome.tabs.query({});
	const seen = new Set<string>();
	const origins: string[] = [];
	for (const tab of tabs) {
		if (!tab.url) continue;
		const origin = readDashboardOriginFromUrl(tab.url);
		if (!origin || seen.has(origin)) continue;
		seen.add(origin);
		origins.push(origin);
	}
	return origins;
}

export async function syncDashboardOriginFromActiveTab(): Promise<string | null> {
	if (typeof chrome === 'undefined' || typeof chrome.tabs?.query !== 'function') {
		return null;
	}

	const [activeTabs, openOrigins] = await Promise.all([
		chrome.tabs.query({ active: true, currentWindow: true }),
		listOpenDashboardTabOrigins(),
	]);

	for (const origin of openOrigins) {
		await rememberDashboardOrigin(origin);
	}

	const rawUrl = activeTabs[0]?.url;
	if (!rawUrl) return openOrigins[0] ?? null;

	const activeOrigin = readDashboardOriginFromUrl(rawUrl);
	if (activeOrigin) {
		await rememberDashboardOrigin(activeOrigin);
		return activeOrigin;
	}
	return openOrigins[0] ?? null;
}
