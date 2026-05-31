const STORAGE_KEY = 'openquok:resolvedCheckoutIds';

function readIds(): Set<string> {
	if (typeof sessionStorage === 'undefined') return new Set();
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return new Set();
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return new Set();
		return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
	} catch {
		return new Set();
	}
}

function writeIds(ids: Set<string>): void {
	if (typeof sessionStorage === 'undefined') return;
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
	} catch {
		// Best-effort; in-memory gate state still applies for this tab session.
	}
}

export function isCheckoutIdResolved(checkoutId: string): boolean {
	const id = checkoutId.trim();
	if (!id) return false;
	return readIds().has(id);
}

export function persistResolvedCheckoutId(checkoutId: string): void {
	const id = checkoutId.trim();
	if (!id) return;
	const ids = readIds();
	if (ids.has(id)) return;
	ids.add(id);
	writeIds(ids);
}
