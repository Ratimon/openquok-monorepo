/** Small JSON-stable deep equality for plain snapshot objects. */
export function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
	if (Array.isArray(a) !== Array.isArray(b)) return false;
	if (Array.isArray(a)) {
		if (a.length !== (b as unknown[]).length) return false;
		for (let i = 0; i < a.length; i++) {
			if (!deepEqual(a[i], (b as unknown[])[i])) return false;
		}
		return true;
	}
	const ak = Object.keys(a as object).sort();
	const bk = Object.keys(b as object).sort();
	if (ak.length !== bk.length) return false;
	for (let i = 0; i < ak.length; i++) {
		if (ak[i] !== bk[i]) return false;
	}
	const ao = a as Record<string, unknown>;
	const bo = b as Record<string, unknown>;
	for (const k of ak) {
		if (!deepEqual(ao[k], bo[k])) return false;
	}
	return true;
}
