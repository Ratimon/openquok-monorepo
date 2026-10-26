const BRIDGE_SESSIONS_KEY = 'openquok:dashboard-bridge-sessions';
const SESSION_TTL_MS = 55 * 60 * 1000;

export type DashboardBridgeSession = {
	dashboardOrigin: string;
	accessToken: string;
	organizationId: string | null;
	updatedAt: number;
};

function normalizeOrigin(origin: string): string | null {
	try {
		return new URL(origin.trim()).origin;
	} catch {
		return null;
	}
}

async function readAllSessions(): Promise<DashboardBridgeSession[]> {
	if (typeof chrome === 'undefined' || !chrome.storage?.session) return [];
	const stored = await chrome.storage.session.get(BRIDGE_SESSIONS_KEY);
	const raw = stored[BRIDGE_SESSIONS_KEY];
	if (!Array.isArray(raw)) return [];
	return raw.filter((entry): entry is DashboardBridgeSession => {
		if (!entry || typeof entry !== 'object') return false;
		const row = entry as Record<string, unknown>;
		return (
			typeof row.dashboardOrigin === 'string' &&
			typeof row.accessToken === 'string' &&
			(row.organizationId === null || typeof row.organizationId === 'string') &&
			typeof row.updatedAt === 'number'
		);
	});
}

function isFresh(session: DashboardBridgeSession): boolean {
	return Date.now() - session.updatedAt < SESSION_TTL_MS;
}

export async function storeDashboardBridgeSession(input: {
	dashboardOrigin: string;
	accessToken: string;
	organizationId: string | null;
}): Promise<void> {
	const dashboardOrigin = normalizeOrigin(input.dashboardOrigin);
	if (!dashboardOrigin || !input.accessToken.trim() || !chrome.storage?.session) return;

	const sessions = await readAllSessions();
	const token = input.accessToken.trim();
	const organizationId = input.organizationId?.trim() || null;
	const existing = sessions.find((s) => normalizeOrigin(s.dashboardOrigin) === dashboardOrigin);
	if (
		existing &&
		existing.accessToken === token &&
		existing.organizationId === organizationId &&
		Date.now() - existing.updatedAt < 10_000
	) {
		return;
	}

	const next: DashboardBridgeSession = {
		dashboardOrigin,
		accessToken: token,
		organizationId,
		updatedAt: Date.now(),
	};

	const without = sessions.filter((s) => normalizeOrigin(s.dashboardOrigin) !== dashboardOrigin);
	without.push(next);
	await chrome.storage.session.set({ [BRIDGE_SESSIONS_KEY]: without });
}

export async function clearDashboardBridgeSession(dashboardOrigin: string): Promise<void> {
	const normalized = normalizeOrigin(dashboardOrigin);
	if (!normalized || !chrome.storage?.session) return;
	const sessions = await readAllSessions();
	const next = sessions.filter((s) => normalizeOrigin(s.dashboardOrigin) !== normalized);
	await chrome.storage.session.set({ [BRIDGE_SESSIONS_KEY]: next });
}

/** First fresh bridge session matching any candidate origin (preference order). */
export async function findDashboardBridgeSession(
	originCandidates: string[]
): Promise<DashboardBridgeSession | null> {
	const sessions = await readAllSessions();
	const seen = new Set<string>();

	for (const candidate of originCandidates) {
		const normalized = normalizeOrigin(candidate);
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		const match = sessions.find((s) => normalizeOrigin(s.dashboardOrigin) === normalized);
		if (match && isFresh(match)) return match;
	}

	for (const session of sessions) {
		if (isFresh(session)) return session;
	}
	return null;
}
