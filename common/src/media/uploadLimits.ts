/**
 * Per-file and per-session upload caps for the media library (not tier-based).
 * Workspace total storage is enforced separately via `media_storage_bytes_per_workspace` in pricing.
 */

/** Max combined size of files added in one batch (drag-drop / multi-select). */
export const MAX_MEDIA_UPLOAD_SESSION_BYTES = 1024 * 1024 * 1024;

/** Backend cap for a single image (or non-video) file. */
export const MAX_MEDIA_IMAGE_UPLOAD_BYTES_BACKEND = 10 * 1024 * 1024;

/** Frontend cap for a single image (or non-video) file before upload. */
export const MAX_MEDIA_IMAGE_UPLOAD_BYTES_FRONTEND = 30 * 1024 * 1024;

/** Max size for a single video file (frontend and backend). */
export const MAX_MEDIA_VIDEO_UPLOAD_BYTES = 1024 * 1024 * 1024;

/**
 * Largest single file the API accepts (multer). Matches video cap.
 * @deprecated Prefer {@link maxMediaUploadBytesForMime} for validation.
 */
export const MAX_MEDIA_UPLOAD_BYTES = MAX_MEDIA_VIDEO_UPLOAD_BYTES;

export type MediaUploadValidationSurface = 'frontend' | 'backend';

function normalizeMime(mimetype: string): string {
	return (mimetype || '').trim().toLowerCase();
}

export function isVideoMediaMime(mimetype: string): boolean {
	return normalizeMime(mimetype).startsWith('video/');
}

const EXTENSION_TO_MIME: Record<string, string> = {
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	gif: 'image/gif',
	webp: 'image/webp',
	svg: 'image/svg+xml',
	avif: 'image/avif',
	mp4: 'video/mp4',
	mov: 'video/quicktime',
	webm: 'video/webm',
	m4v: 'video/x-m4v',
	mpeg: 'video/mpeg',
	mpg: 'video/mpeg',
	pdf: 'application/pdf'
};

/** Prefer the browser MIME; fall back to filename extension when missing or generic. */
export function inferMediaMimeType(filename: string, mimetype?: string | null): string {
	const normalized = normalizeMime(mimetype ?? '');
	if (normalized && normalized !== 'application/octet-stream') {
		return normalized;
	}
	const ext = filename.split('.').pop()?.toLowerCase() ?? '';
	return EXTENSION_TO_MIME[ext] ?? (normalized || 'application/octet-stream');
}

/** Per-file byte cap for the given MIME type and validation surface. */
export function maxMediaUploadBytesForMime(
	mimetype: string,
	surface: MediaUploadValidationSurface
): number {
	if (isVideoMediaMime(mimetype)) {
		return MAX_MEDIA_VIDEO_UPLOAD_BYTES;
	}
	return surface === 'frontend'
		? MAX_MEDIA_IMAGE_UPLOAD_BYTES_FRONTEND
		: MAX_MEDIA_IMAGE_UPLOAD_BYTES_BACKEND;
}

function formatLimitLabel(bytes: number): string {
	const gb = bytes / (1024 * 1024 * 1024);
	if (gb >= 1 && Number.isInteger(gb)) {
		return `${gb} GB`;
	}
	const mb = bytes / (1024 * 1024);
	if (Number.isInteger(mb)) {
		return `${mb} MB`;
	}
	return `${Math.round(mb)} MB`;
}

/** User-facing hint for empty states and tooltips. */
export function mediaUploadLimitsHint(): string {
	return `${formatLimitLabel(MAX_MEDIA_IMAGE_UPLOAD_BYTES_FRONTEND)} per image, ${formatLimitLabel(MAX_MEDIA_VIDEO_UPLOAD_BYTES)} per video`;
}

/** @deprecated Use {@link mediaUploadLimitsHint} for UI copy. */
export function maxMediaUploadShortLabel(): string {
	return mediaUploadLimitsHint();
}

/** Returns an error message when the file exceeds its cap, or `null` if valid. */
export function validateMediaFileUploadSize(
	size: number,
	mimetype: string,
	surface: MediaUploadValidationSurface
): string | null {
	if (!Number.isFinite(size) || size < 0) {
		return 'Invalid file size.';
	}
	const max = maxMediaUploadBytesForMime(mimetype, surface);
	if (size <= max) {
		return null;
	}
	const kind = isVideoMediaMime(mimetype) ? 'Video' : 'Image';
	return `${kind} must be ${formatLimitLabel(max)} or smaller (file is ${formatLimitLabel(size)}).`;
}

/** Returns an error message when the batch exceeds the session cap, or `null` if valid. */
export function validateMediaUploadSessionSize(totalBytes: number): string | null {
	if (!Number.isFinite(totalBytes) || totalBytes < 0) {
		return 'Invalid upload size.';
	}
	if (totalBytes <= MAX_MEDIA_UPLOAD_SESSION_BYTES) {
		return null;
	}
	return `Upload size limit exceeded. Maximum ${formatLimitLabel(MAX_MEDIA_UPLOAD_SESSION_BYTES)} per upload session.`;
}
