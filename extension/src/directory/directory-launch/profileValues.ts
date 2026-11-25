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

const AUTO_LAUNCH_PROFILE_MEDIA_BUCKET = 'auto_launch_profile_media';

function normalizeObjectStorageKey(key: string): string {
	let trimmed = key.trim().replace(/^\/+/, '');
	if (trimmed.startsWith(`${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}/`)) {
		trimmed = trimmed.slice(AUTO_LAUNCH_PROFILE_MEDIA_BUCKET.length + 1);
	}
	return trimmed.split('?')[0]?.toLowerCase() ?? trimmed.toLowerCase();
}

/** Canonical object key for a profile media ref (storage path, https URL, or image/download link). */
export function mediaRefCanonicalKey(path: string): string {
	const trimmed = path.trim();
	if (!trimmed) return '';
	try {
		const parsed = new URL(trimmed);
		const imageUrl = parsed.searchParams.get('imageUrl')?.trim();
		if (imageUrl) return normalizeObjectStorageKey(decodeURIComponent(imageUrl));
		return `${parsed.hostname.toLowerCase()}${parsed.pathname.toLowerCase()}`;
	} catch {
		return normalizeObjectStorageKey(trimmed);
	}
}

function mediaRefsEquivalent(a: string, b: string): boolean {
	const ka = mediaRefCanonicalKey(a);
	const kb = mediaRefCanonicalKey(b);
	if (!ka || !kb) return false;
	if (ka === kb) return true;
	const ba = ka.split('/').pop() ?? '';
	const bb = kb.split('/').pop() ?? '';
	return ba.length > 0 && ba === bb;
}

function dedupeMediaPaths(paths: readonly string[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const path of paths) {
		const key = mediaRefCanonicalKey(path);
		if (!key || seen.has(key)) continue;
		seen.add(key);
		out.push(path);
	}
	return out;
}

function collectGalleryEntriesExcludingLogo(snapshot: AutoLaunchProfileSnapshot): {
	paths: string[];
	indices: number[];
} {
	const paths = resolveProfileStoragePathList(snapshot, 'profile_data.gallery_urls');
	const logoRefs = resolveProfileStoragePathList(snapshot, 'logo_url');
	const kept: string[] = [];
	const indices: number[] = [];
	for (let index = 0; index < paths.length; index += 1) {
		const entry = paths[index];
		if (!entry) continue;
		if (logoRefs.some((logo) => mediaRefsEquivalent(entry, logo))) continue;
		kept.push(entry);
		indices.push(index);
	}
	return { paths: dedupeMediaPaths(kept), indices };
}

/** Gallery paths that are not the same asset as `logo_url` (avoid screenshot fills with the icon). */
export function galleryPathsExcludingLogo(snapshot: AutoLaunchProfileSnapshot): string[] {
	return collectGalleryEntriesExcludingLogo(snapshot).paths;
}

function hasMeaningfulGalleryUrls(snapshot: AutoLaunchProfileSnapshot): boolean {
	return galleryPathsExcludingLogo(snapshot).length > 0;
}

/**
 * Merge main-profile fallbacks for directory variants: tagline, social URLs, logo, and gallery screenshots.
 */
export function mergeMainProfileSocialData(
	active: AutoLaunchProfileSnapshot,
	main: AutoLaunchProfileSnapshot | null | undefined
): AutoLaunchProfileSnapshot {
	if (!main) return active;

	let next: AutoLaunchProfileSnapshot = active;
	let changed = false;

	const activePd = active.profile_data ?? {};
	const mainPd = main.profile_data ?? {};
	const mergedPd: Record<string, unknown> = { ...(active.profile_data ?? {}) };

	if (!active.tagline?.trim() && main.tagline?.trim()) {
		next = { ...next, tagline: main.tagline };
		changed = true;
	}

	if (!active.logo_url?.trim() && main.logo_url?.trim()) {
		next = { ...next, logo_url: main.logo_url };
		changed = true;
		const mainLogoLabel =
			typeof mainPd.logo_label === 'string' ? mainPd.logo_label.trim() : '';
		if (mainLogoLabel) {
			mergedPd.logo_label = mainPd.logo_label;
		}
	}

	const activeSnapshotForGallery: AutoLaunchProfileSnapshot = {
		...active,
		profile_data: activePd as AutoLaunchProfileSnapshot['profile_data'],
	};
	const mainSnapshotForGallery: AutoLaunchProfileSnapshot = {
		...main,
		logo_url: next.logo_url ?? main.logo_url,
		profile_data: mainPd as AutoLaunchProfileSnapshot['profile_data'],
	};
	if (
		!hasMeaningfulGalleryUrls(activeSnapshotForGallery) &&
		hasMeaningfulGalleryUrls(mainSnapshotForGallery)
	) {
		const mainGallery = collectGalleryEntriesExcludingLogo(mainSnapshotForGallery);
		mergedPd.gallery_urls = mainGallery.paths;
		const mainLabels = mainPd.gallery_labels;
		if (Array.isArray(mainLabels) && mainGallery.paths.length > 0) {
			mergedPd.gallery_labels = mainGallery.indices
				.map((slot) => mainLabels[slot])
				.filter((label): label is string => typeof label === 'string' && label.trim().length > 0);
		}
		changed = true;
	}

	if (main.profile_data) {
		for (const key of SOCIAL_PROFILE_DATA_KEYS) {
			const activeVal = activePd[key as keyof typeof activePd];
			if (typeof activeVal === 'string' && activeVal.trim()) continue;
			const mainVal = mainPd[key as keyof typeof mainPd];
			if (typeof mainVal === 'string' && mainVal.trim()) {
				mergedPd[key] = mainVal;
				changed = true;
			}
		}
		const activeLaunchVideo = activePd.launch_video_url;
		const mainLaunchVideo = mainPd.launch_video_url;
		if (
			(typeof activeLaunchVideo !== 'string' || !activeLaunchVideo.trim()) &&
			typeof mainLaunchVideo === 'string' &&
			mainLaunchVideo.trim()
		) {
			mergedPd.launch_video_url = mainLaunchVideo;
			changed = true;
		}
	}

	if (!changed) return active;
	return { ...next, profile_data: mergedPd as AutoLaunchProfileSnapshot['profile_data'] };
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
