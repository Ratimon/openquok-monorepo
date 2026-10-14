import type { AutoLaunchProfileSnapshot } from 'openquok-common';

function readPath(root: Record<string, unknown>, path: string): unknown {
	const segments = path.split('.').filter(Boolean);
	let current: unknown = root;
	for (const segment of segments) {
		if (!current || typeof current !== 'object') return undefined;
		current = (current as Record<string, unknown>)[segment];
	}
	return current;
}

/** Resolve `profilePath` from intent snapshot (supports `profile_data.*` paths). */
export function resolveProfileValue(
	snapshot: AutoLaunchProfileSnapshot,
	profilePath: string
): string | null {
	const root: Record<string, unknown> = {
		name: snapshot.name,
		tagline: snapshot.tagline,
		description: snapshot.description,
		website_url: snapshot.website_url,
		logo_url: snapshot.logo_url,
		profile_data: snapshot.profile_data ?? {},
		integration_customer_id: snapshot.integration_customer_id,
	};

	const value = readPath(root, profilePath);
	if (value === null || value === undefined) return null;
	if (typeof value === 'string') return value.trim() ? value : null;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (Array.isArray(value)) {
		return value.length > 0 ? value.map(String).join(', ') : null;
	}
	return null;
}
