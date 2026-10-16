import { sha256Utf8Hex } from '../crypto/sha256Utf8Hex.js';

import type {
	AutoLaunchExtensionConfig,
	AutoLaunchProfileSnapshot,
} from '../browser-extension/pageAssist.js';

function readPath(root: Record<string, unknown>, path: string): unknown {
	const segments = path.split('.').filter(Boolean);
	let current: unknown = root;
	for (const segment of segments) {
		if (!current || typeof current !== 'object') return undefined;
		current = (current as Record<string, unknown>)[segment];
	}
	return current;
}

/** Unique non-empty `profilePath` values from extension config steps (fill-relevant paths). */
export function collectProfilePathsFromExtensionConfig(
	config: AutoLaunchExtensionConfig | null | undefined
): string[] {
	const seen = new Set<string>();
	const paths: string[] = [];

	for (const step of config?.steps ?? []) {
		for (const field of step.fields ?? []) {
			const profilePath = typeof field.profilePath === 'string' ? field.profilePath.trim() : '';
			if (!profilePath || seen.has(profilePath)) continue;
			seen.add(profilePath);
			paths.push(profilePath);
		}
	}

	return paths.sort();
}

/**
 * Resolve and normalize a value at `profilePath` on a profile snapshot.
 * Matches directory-launch extension fill semantics and DB backfill helpers.
 */
export function resolveProfilePathValue(
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
	if (typeof value === 'string') return value.trim() ? value.trim() : null;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (Array.isArray(value)) {
		return value.length > 0 ? value.map(String).join(', ') : null;
	}
	return null;
}

/** Canonical JSON-like payload hashed for `listing_profile_fingerprint` (sorted keys). */
export function buildListingProfileFingerprintPayload(
	snapshot: AutoLaunchProfileSnapshot,
	profilePaths: string[]
): string {
	const parts = [...profilePaths].sort().map((profilePath) => {
		const normalized = resolveProfilePathValue(snapshot, profilePath);
		const keyJson = JSON.stringify(profilePath);
		const valueJson = normalized === null ? 'null' : JSON.stringify(normalized);
		return `${keyJson}:${valueJson}`;
	});
	return `{${parts.join(',')}}`;
}

/** SHA-256 hex digest of fill-relevant profile paths for a snapshot + extension config. */
export function computeListingProfileFingerprint(
	snapshot: AutoLaunchProfileSnapshot,
	extensionConfig: AutoLaunchExtensionConfig | null | undefined
): string {
	const profilePaths = collectProfilePathsFromExtensionConfig(extensionConfig);
	const payload = buildListingProfileFingerprintPayload(snapshot, profilePaths);
	return sha256Utf8Hex(payload);
}
