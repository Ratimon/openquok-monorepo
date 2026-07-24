/** Prefer non-empty runtime values so blank DB fields do not wipe static defaults. */
export function mergeCompanyConfigDefaults(
	defaults: Record<string, string>,
	runtime: Record<string, unknown> | null | undefined
): Record<string, string> {
	const merged = { ...defaults };
	if (!runtime) return merged;
	for (const [key, value] of Object.entries(runtime)) {
		if (value == null) continue;
		const str = typeof value === 'string' ? value : String(value);
		if (str.trim() !== '') merged[key] = str;
	}
	return merged;
}
