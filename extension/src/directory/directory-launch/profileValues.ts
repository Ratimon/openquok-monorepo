import type { AutoLaunchProfileSnapshot, LaunchStepField } from 'openquok-common';
import { resolveProfilePathValue } from 'openquok-common';

const SOCIAL_PROFILE_DATA_KEYS = [
	'social_x',
	'social_github',
	'social_instagram',
	'social_linkedin',
	'social_tiktok',
	'social_facebook',
	'social_youtube',
	'social_bluesky',
] as const;

/**
 * Resolve `profilePath` on a handoff snapshot (comma-joins string arrays such as
 * `profile_data.gallery_urls`, `profile_data.tags` (derived at fill time when unset),
 * and PeerPush discovery lists `categories`, `use_cases`, `target_audiences`, and `platforms`).
 */
export function resolveProfileValue(
	snapshot: AutoLaunchProfileSnapshot,
	profilePath: string
): string | null {
	return resolveProfilePathValue(snapshot, profilePath);
}

/** Fill empty social URLs on a directory variant from the main product profile. */
export function mergeMainProfileSocialData(
	active: AutoLaunchProfileSnapshot,
	main: AutoLaunchProfileSnapshot | null | undefined
): AutoLaunchProfileSnapshot {
	if (!main?.profile_data) return active;
	const activePd = active.profile_data ?? {};
	const mainPd = main.profile_data ?? {};
	const mergedPd: Record<string, unknown> = { ...activePd };
	let changed = false;
	for (const key of SOCIAL_PROFILE_DATA_KEYS) {
		const activeVal = activePd[key as keyof typeof activePd];
		if (typeof activeVal === 'string' && activeVal.trim()) continue;
		const mainVal = mainPd[key as keyof typeof mainPd];
		if (typeof mainVal === 'string' && mainVal.trim()) {
			mergedPd[key] = mainVal;
			changed = true;
		}
	}
	if (!changed) return active;
	return { ...active, profile_data: mergedPd as AutoLaunchProfileSnapshot['profile_data'] };
}

/** Scalar profile value for fill/compare, including main-profile social fallbacks and `profileSourcePaths`. */
export function resolveLaunchProfileScalar(
	snapshot: AutoLaunchProfileSnapshot,
	field: LaunchStepField,
	mainSnapshot?: AutoLaunchProfileSnapshot | null
): string | null {
	const effective = mergeMainProfileSocialData(snapshot, mainSnapshot);
	const primary = field.profilePath?.trim();
	let value = primary ? resolveProfileValue(effective, primary) : null;
	if (!value && field.profileSourcePaths?.length) {
		for (const path of field.profileSourcePaths) {
			value = resolveProfileValue(effective, path.trim());
			if (value) break;
		}
	}
	return value;
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
