function isPlainSettingsObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Merge a partial provider-settings update into what we already have per integration.
 * Top-level buckets (`threads`, `instagram`, a future `tiktok`, …) are shallow-merged so UI that
 * only emits one subsection does not wipe siblings (e.g. `threads.replies` from the composer).
 * Non-objects (and arrays) are replaced wholesale by `next`, matching normal `{ ...current, ...next }`.
 */
export function mergeProviderSettingsPatch(
	current: Record<string, unknown>,
	next: Record<string, unknown>
): Record<string, unknown> {
	const merged: Record<string, unknown> = { ...current };
	for (const key of Object.keys(next)) {
		const n = next[key];
		const c = current[key];
		if (isPlainSettingsObject(c) && isPlainSettingsObject(n)) {
			merged[key] = { ...c, ...n };
		} else {
			merged[key] = n;
		}
	}
	return merged;
}

/** Deep-clone provider settings for set snapshots (falls back to empty object on failure). */
export function cloneProviderSettingsByIntegrationId(
	source: Record<string, Record<string, unknown>> | undefined
): Record<string, Record<string, unknown>> {
	try {
		return JSON.parse(JSON.stringify(source ?? {})) as Record<string, Record<string, unknown>>;
	} catch {
		return {};
	}
}
