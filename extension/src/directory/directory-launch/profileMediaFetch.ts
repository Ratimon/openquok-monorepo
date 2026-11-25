import type { AutoLaunchProfileSnapshot, LaunchStepField } from 'openquok-common';
import {
	resolveGalleryDisplayLabelForSlot,
	resolveLogoDisplayName,
} from 'openquok-common';

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

function attachStorageExtension(displayLabel: string, storageFileName: string): string {
	const trimmed = displayLabel.trim();
	if (/\.[a-z0-9]+$/i.test(trimmed)) return trimmed;
	const ext = storageFileName.match(/\.[a-z0-9]+$/i)?.[0] ?? '.png';
	const safeBase = trimmed.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'image';
	return `${safeBase}${ext}`;
}

/** File input `name` for directory uploads (gallery labels or sensible defaults, not raw storage keys). */
export function profileMediaDownloadFileName(
	storagePath: string,
	index: number,
	field: LaunchStepField,
	snapshot: AutoLaunchProfileSnapshot
): string {
	const storageFileName = fileNameFromStoragePath(storagePath);
	const profilePath = field.profilePath?.trim() ?? '';
	const profileData = snapshot.profile_data ?? {};

	if (field.fillMode === 'files' && profilePath === 'profile_data.gallery_urls') {
		const galleryLabels = Array.isArray(profileData.gallery_labels)
			? profileData.gallery_labels
			: undefined;
		const display = resolveGalleryDisplayLabelForSlot(
			storagePath,
			index,
			galleryLabels?.[index]
		);
		return attachStorageExtension(display, storageFileName);
	}

	if (field.fillMode === 'file' && profilePath === 'logo_url') {
		return attachStorageExtension(resolveLogoDisplayName(snapshot), storageFileName);
	}

	return storageFileName;
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

/** Absolute URL a third-party form can fetch (pass-through https or public image/download). */
export async function resolveProfileMediaPublicUrl(
	dashboardOrigin: string,
	storagePathOrUrl: string
): Promise<string | null> {
	const trimmed = storagePathOrUrl.trim();
	if (!trimmed) return null;
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	const key = normalizeStorageKey(trimmed);
	if (!key) return null;
	const params = new URLSearchParams({
		databaseName: AUTO_LAUNCH_PROFILE_MEDIA_BUCKET,
		imageUrl: key,
	});
	const apiOrigin = await resolveApiOriginForDashboard(dashboardOrigin);
	return `${apiRoot(apiOrigin)}/image/download?${params.toString()}`;
}

/** Download a logo or gallery object for directory file inputs (public image download route). */
export async function fetchProfileMediaFile(
	dashboardOrigin: string,
	storagePathOrUrl: string
): Promise<File | null> {
	const trimmed = storagePathOrUrl.trim();
	if (!trimmed) return null;

	const downloadUrl = await resolveProfileMediaPublicUrl(dashboardOrigin, trimmed);
	if (!downloadUrl) return null;

	const response = await fetch(downloadUrl);
	if (!response.ok) return null;
	const blob = await response.blob();
	const name = fileNameFromStoragePath(trimmed);
	const type = blob.type && blob.type !== 'application/octet-stream' ? blob.type : guessMimeFromName(name);
	return new File([blob], name, { type });
}
