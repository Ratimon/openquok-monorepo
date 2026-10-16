import type { AutoLaunchProfileSnapshot } from 'openquok-common';
import { resolveProfilePathValue } from 'openquok-common';

/**
 * Resolve `profilePath` on a handoff snapshot (comma-joins arrays such as
 * `profile_data.gallery_urls` and `profile_data.tags`).
 */
export function resolveProfileValue(
	snapshot: AutoLaunchProfileSnapshot,
	profilePath: string
): string | null {
	return resolveProfilePathValue(snapshot, profilePath);
}
