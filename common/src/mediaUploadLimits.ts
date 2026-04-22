/**
 * Maximum size in bytes for a single user-owned media file on upload (images, video, audio, PDF).
 * Used by the API (multer) and the web app (Uppy and client-side checks).
 *
 * Change this value in one place to adjust the product-wide cap for uploads.
 */
export const MAX_MEDIA_UPLOAD_BYTES = 1024 * 1024 * 1024;

/** Short label for empty states and tooltips (e.g. `1 GB`, `512 MB`). */
export function maxMediaUploadShortLabel(): string {
	const n = MAX_MEDIA_UPLOAD_BYTES;
	const gb = n / (1024 * 1024 * 1024);
	if (gb >= 1 && Number.isInteger(gb)) {
		return `${gb} GB`;
	}
	const mb = n / (1024 * 1024);
	if (Number.isInteger(mb)) {
		return `${mb} MB`;
	}
	return `${Math.round(mb)} MB`;
}
