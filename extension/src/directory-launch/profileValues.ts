import type { AutoLaunchProfileSnapshot } from 'openquok-common';
import { resolveProfilePathValue } from 'openquok-common';

/**
 * Resolve `profilePath` on a handoff snapshot (comma-joins string arrays such as
 * `profile_data.gallery_urls`, `profile_data.tags`, and PeerPush discovery lists
 * `categories`, `use_cases`, `target_audiences`, `platforms`, and `alternatives`).
 */
export function resolveProfileValue(
	snapshot: AutoLaunchProfileSnapshot,
	profilePath: string
): string | null {
	return resolveProfilePathValue(snapshot, profilePath);
}

function readProfilePathRaw(snapshot: AutoLaunchProfileSnapshot, profilePath: string): unknown {
	const root: Record<string, unknown> = {
		name: snapshot.name,
		tagline: snapshot.tagline,
		description: snapshot.description,
		website_url: snapshot.website_url,
		logo_url: snapshot.logo_url,
		profile_data: snapshot.profile_data ?? {},
		integration_customer_id: snapshot.integration_customer_id,
	};
	const segments = profilePath.split('.').filter(Boolean);
	let current: unknown = root;
	for (const segment of segments) {
		if (!current || typeof current !== 'object') return undefined;
		current = (current as Record<string, unknown>)[segment];
	}
	return current;
}

/** Storage paths or URLs for file fill (`logo_url`, `profile_data.gallery_urls`, …). */
export function resolveProfileStoragePathList(
	snapshot: AutoLaunchProfileSnapshot,
	profilePath: string
): string[] {
	const value = readProfilePathRaw(snapshot, profilePath);
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed ? [trimmed] : [];
	}
	if (Array.isArray(value)) {
		return value
			.map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry).trim()))
			.filter(Boolean);
	}
	return [];
}
