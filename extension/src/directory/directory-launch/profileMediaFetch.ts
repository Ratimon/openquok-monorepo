import { resolveApiOriginForDashboard } from '../../shared/dashboardApiOrigin.js';

const AUTO_LAUNCH_PROFILE_MEDIA_BUCKET = 'auto_launch_profile_media';

function apiRoot(origin: string): string {
	return `${origin.replace(/\/+$/, '')}/api/v1`;
}

function fileNameFromStoragePath(storagePath: string): string {
	const segment = storagePath.split('/').pop()?.trim() ?? 'image';
	if (/\.[a-z0-9]+$/i.test(segment)) return segment;
	return `${segment}.webp`;
}

function guessMimeFromName(name: string): string {
	const lower = name.toLowerCase();
	if (lower.endsWith('.png')) return 'image/png';
	if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
	if (lower.endsWith('.webp')) return 'image/webp';
	if (lower.endsWith('.gif')) return 'image/gif';
	return 'application/octet-stream';
}

function normalizeStorageKey(storagePath: string): string {
	let key = storagePath.trim().replace(/^\/+/, '');
	if (key.startsWith(`${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}/`)) {
		key = key.slice(AUTO_LAUNCH_PROFILE_MEDIA_BUCKET.length + 1);
	}
	return key;
}

/** Download a logo or gallery object for directory file inputs (public image download route). */
export async function fetchProfileMediaFile(
	dashboardOrigin: string,
	storagePathOrUrl: string
): Promise<File | null> {
	const trimmed = storagePathOrUrl.trim();
	if (!trimmed) return null;

	let downloadUrl: string;
	if (/^https?:\/\//i.test(trimmed)) {
		downloadUrl = trimmed;
	} else {
		const key = normalizeStorageKey(trimmed);
		if (!key) return null;
		const params = new URLSearchParams({
			databaseName: AUTO_LAUNCH_PROFILE_MEDIA_BUCKET,
			imageUrl: key,
		});
		const apiOrigin = await resolveApiOriginForDashboard(dashboardOrigin);
		downloadUrl = `${apiRoot(apiOrigin)}/image/download?${params.toString()}`;
	}

	const response = await fetch(downloadUrl);
	if (!response.ok) return null;
	const blob = await response.blob();
	const name = fileNameFromStoragePath(trimmed);
	const type = blob.type && blob.type !== 'application/octet-stream' ? blob.type : guessMimeFromName(name);
	return new File([blob], name, { type });
}
