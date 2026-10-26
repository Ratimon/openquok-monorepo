import { clearDashboardBridgeSession } from './dashboardBridgeStorage.js';
import { clearCachedMintedAccessToken } from './dashboardMintedAccessTokenCache.js';

function normalizeOrigin(origin: string): string | null {
	try {
		return new URL(origin.trim()).origin;
	} catch {
		return null;
	}
}

export async function clearExtensionDashboardSession(dashboardOrigin: string): Promise<void> {
	const normalized = normalizeOrigin(dashboardOrigin);
	if (!normalized) return;
	await Promise.all([
		clearDashboardBridgeSession(normalized),
		clearCachedMintedAccessToken(normalized),
	]);
}

export async function clearExtensionDashboardSessions(origins: string[]): Promise<void> {
	const seen = new Set<string>();
	for (const raw of origins) {
		const normalized = normalizeOrigin(raw);
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		await clearExtensionDashboardSession(normalized);
	}
}
