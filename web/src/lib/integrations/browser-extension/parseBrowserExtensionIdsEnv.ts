/** Preferred store-key order when expanding a map of extension IDs (Chromium-family first). */
const BROWSER_EXTENSION_STORE_KEY_ORDER = ['chromium', 'chrome', 'edge', 'firefox'] as const;

function uniqueNonEmptyIds(ids: string[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const raw of ids) {
		const id = raw.trim();
		if (!id || seen.has(id)) continue;
		seen.add(id);
		out.push(id);
	}
	return out;
}

function orderedIdsFromStoreMap(entries: [string, string][]): string[] {
	const byKey = new Map<string, string>();
	for (const [key, value] of entries) {
		const id = String(value).trim();
		if (!id) continue;
		byKey.set(key.trim().toLowerCase(), id);
	}
	const ordered: string[] = [];
	for (const key of BROWSER_EXTENSION_STORE_KEY_ORDER) {
		const id = byKey.get(key);
		if (id) ordered.push(id);
	}
	const remainingKeys = [...byKey.keys()].sort();
	for (const key of remainingKeys) {
		if ((BROWSER_EXTENSION_STORE_KEY_ORDER as readonly string[]).includes(key)) continue;
		const id = byKey.get(key);
		if (id) ordered.push(id);
	}
	return uniqueNonEmptyIds(ordered);
}

function parseCommaStoreMap(raw: string): string[] {
	const parts = raw
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
	if (parts.length === 0) return [];
	const entries: [string, string][] = [];
	const bareIds: string[] = [];
	for (const part of parts) {
		const colon = part.indexOf(':');
		if (colon > 0) {
			entries.push([part.slice(0, colon).trim(), part.slice(colon + 1).trim()]);
		} else {
			bareIds.push(part);
		}
	}
	if (entries.length > 0) {
		return uniqueNonEmptyIds([...orderedIdsFromStoreMap(entries), ...bareIds]);
	}
	return uniqueNonEmptyIds(bareIds);
}

function parseJsonBrowserExtensionIds(raw: string): string[] | null {
	try {
		const parsed: unknown = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return uniqueNonEmptyIds(parsed.map((value) => String(value)));
		}
		if (parsed && typeof parsed === 'object') {
			const entries = Object.entries(parsed as Record<string, unknown>).map(
				([key, value]) => [key, String(value)] as [string, string]
			);
			return orderedIdsFromStoreMap(entries);
		}
	} catch {
		/* not JSON — caller may fall back to comma map */
	}
	return null;
}

/**
 * Parse `VITE_OPENQUOK_BROWSER_EXTENSION_IDS` as JSON (`{"chromium":"…","edge":"…"}` or `["id1","id2"]`)
 * or a comma map (`chromium:id1,edge:id2`).
 */
export function parseBrowserExtensionIdsEnv(raw: string): string[] {
	const trimmed = raw.trim();
	if (!trimmed) return [];
	if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
		const fromJson = parseJsonBrowserExtensionIds(trimmed);
		if (fromJson && fromJson.length > 0) return fromJson;
	}
	return parseCommaStoreMap(trimmed);
}
