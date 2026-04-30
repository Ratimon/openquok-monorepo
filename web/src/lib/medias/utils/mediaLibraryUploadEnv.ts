/**
 * How the account media library sends files: local disk via API, direct multipart to R2, or full file POST via API.
 *
 * This is **only** the browser upload strategy. It is unrelated to backend `STORAGE_PROVIDER` (`r2` vs `local`),
 * which chooses where the API stores bytes after upload.
 */

export type MediaLibraryUploadMode = 'local' | 'direct' | 'api';

/**
 * Reads {@link import.meta.env.VITE_MEDIA_LIBRARY_UPLOAD} (`local` | `direct` | `api` and synonyms).
 * If unset or empty, defaults to `direct` (presigned multipart to R2).
 */
export function resolveMediaLibraryUploadMode(): MediaLibraryUploadMode {
	const raw = String(import.meta.env?.VITE_MEDIA_LIBRARY_UPLOAD ?? '').trim().toLowerCase();
	if (!raw) {
		return 'direct';
	}
	return mapPrimaryEnv(raw);
}

function mapPrimaryEnv(raw: string): MediaLibraryUploadMode {
	if (raw === 'local') {
		return 'local';
	}
	if (raw === 'direct' || raw === 'multipart' || raw === 'presigned') {
		return 'direct';
	}
	if (raw === 'api' || raw === 'proxy' || raw === 'server' || raw === 'xhr') {
		return 'api';
	}
	if (import.meta.env.DEV) {
		console.warn(
			`[openquok] Unknown VITE_MEDIA_LIBRARY_UPLOAD="${raw}". Expected local | direct | api. Using direct.`
		);
	}
	return 'direct';
}
