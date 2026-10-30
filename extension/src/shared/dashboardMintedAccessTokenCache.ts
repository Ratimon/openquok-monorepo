const MINTED_ACCESS_TOKENS_KEY = 'openquok:minted-access-tokens';
const MINTED_TOKEN_TTL_MS = 50 * 60 * 1000;

type MintedAccessTokenEntry = {
	dashboardOrigin: string;
	accessToken: string;
	mintedAt: number;
};

function normalizeOrigin(origin: string): string | null {
	try {
		return new URL(origin.trim()).origin;
	} catch {
		return null;
	}
}

async function readEntries(): Promise<MintedAccessTokenEntry[]> {
	if (typeof chrome === 'undefined' || !chrome.storage?.session) return [];
	const stored = await chrome.storage.session.get(MINTED_ACCESS_TOKENS_KEY);
	const raw = stored[MINTED_ACCESS_TOKENS_KEY];
	if (!Array.isArray(raw)) return [];
	return raw.filter((entry): entry is MintedAccessTokenEntry => {
		if (!entry || typeof entry !== 'object') return false;
		const row = entry as Record<string, unknown>;
		return (
			typeof row.dashboardOrigin === 'string' &&
			typeof row.accessToken === 'string' &&
			typeof row.mintedAt === 'number'
		);
	});
}

export async function readCachedMintedAccessToken(dashboardOrigin: string): Promise<string | null> {
	const normalized = normalizeOrigin(dashboardOrigin);
	if (!normalized) return null;
	const entries = await readEntries();
	const match = entries.find((entry) => normalizeOrigin(entry.dashboardOrigin) === normalized);
	if (!match) return null;
	if (Date.now() - match.mintedAt > MINTED_TOKEN_TTL_MS) return null;
	return match.accessToken.trim() || null;
}

export async function cacheMintedAccessToken(
	dashboardOrigin: string,
	accessToken: string
): Promise<void> {
	const normalized = normalizeOrigin(dashboardOrigin);
	if (!normalized || !accessToken.trim() || !chrome.storage?.session) return;
	const entries = await readEntries();
	const next: MintedAccessTokenEntry = {
		dashboardOrigin: normalized,
		accessToken: accessToken.trim(),
		mintedAt: Date.now(),
	};
	const without = entries.filter((entry) => normalizeOrigin(entry.dashboardOrigin) !== normalized);
	without.push(next);
	await chrome.storage.session.set({ [MINTED_ACCESS_TOKENS_KEY]: without });
}

export async function clearCachedMintedAccessToken(dashboardOrigin: string): Promise<void> {
	const normalized = normalizeOrigin(dashboardOrigin);
	if (!normalized || !chrome.storage?.session) return;
	const entries = await readEntries();
	const next = entries.filter((entry) => normalizeOrigin(entry.dashboardOrigin) !== normalized);
	await chrome.storage.session.set({ [MINTED_ACCESS_TOKENS_KEY]: next });
}
