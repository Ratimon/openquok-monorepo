import { loadAutoLaunchState } from '../directory/auto-launch/sessionStorage.js';

export const LAST_DASHBOARD_ORIGIN_KEY = 'openquok:last-dashboard-origin';

const DEFAULT_DASHBOARD_ORIGINS = [
	'https://www.openquok.com',
	'https://localhost:5173',
	'http://localhost:5173',
];

function normalizeDashboardOrigin(origin: string): string | null {
	const trimmed = origin.trim();
	if (!trimmed) return null;
	try {
		return new URL(trimmed).origin;
	} catch {
		return null;
	}
}

export async function rememberDashboardOrigin(origin: string): Promise<void> {
	const normalized = normalizeDashboardOrigin(origin);
	if (!normalized) return;
	await chrome.storage.local.set({ [LAST_DASHBOARD_ORIGIN_KEY]: normalized });
}

/** Stored handoff origin first, then active session origin, then production + local dev defaults. */
export async function listDashboardOriginCandidates(): Promise<string[]> {
	const [storageResult, handoffState] = await Promise.all([
		chrome.storage.local.get(LAST_DASHBOARD_ORIGIN_KEY),
		loadAutoLaunchState(),
	]);

	const candidates: string[] = [];
	const seen = new Set<string>();

	const push = (raw?: string | null): void => {
		if (raw == null || typeof raw !== 'string') return;
		const normalized = normalizeDashboardOrigin(raw);
		if (!normalized || seen.has(normalized)) return;
		seen.add(normalized);
		candidates.push(normalized);
	};

	push(storageResult[LAST_DASHBOARD_ORIGIN_KEY] as string | undefined);
	push(handoffState?.dashboardOrigin);

	const remembered =
		normalizeDashboardOrigin(String(storageResult[LAST_DASHBOARD_ORIGIN_KEY] ?? '')) ??
		normalizeDashboardOrigin(handoffState?.dashboardOrigin ?? '');

	if (remembered) {
		// Avoid probing stale localhost dev cookies when the user already uses production (or another host).
		const host = new URL(remembered).hostname.toLowerCase();
		const isLocal =
			host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');
		if (!isLocal) {
			return candidates;
		}
	}

	for (const defaultOrigin of DEFAULT_DASHBOARD_ORIGINS) {
		push(defaultOrigin);
	}

	return candidates;
}
