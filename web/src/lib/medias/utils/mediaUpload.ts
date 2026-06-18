import type Uppy from '@uppy/core';
import type { MediaUploadProgrammerModel } from '$lib/medias/Media.repository.svelte';
import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import {
	inferMediaMimeType,
	MAX_MEDIA_VIDEO_UPLOAD_BYTES,
	validateMediaFileUploadSize,
	validateMediaUploadSessionSize
} from 'openquok-common';
import { authenticationRepository } from '$lib/user-auth/index';
import { normalizeApiBaseUrl } from '$lib/utils/path';

// --- Upload mode (VITE_MEDIA_LIBRARY_UPLOAD) ---

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

// --- API helpers ---

export function mediaUploadApiUrl(path: string): string {
	const raw = String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? '');
	const base = normalizeApiBaseUrl(raw);
	const p = path.startsWith('/') ? path : `/${path}`;
	return base ? `${base}${p}` : p;
}

export async function postMediaUploadJson(params: {
	path: string;
	token: string | null;
	body: unknown;
}): Promise<Record<string, unknown>> {
	const res = await fetch(mediaUploadApiUrl(params.path), {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(params.token ? { Authorization: `Bearer ${params.token}` } : {})
		},
		credentials: 'include',
		body: JSON.stringify(params.body)
	});
	const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
	if (!res.ok) {
		const msg =
			(typeof json?.message === 'string' && json.message) ||
			(typeof json?.msg === 'string' && json.msg) ||
			`Request failed with status ${res.status}`;
		throw new Error(msg);
	}
	return json ?? {};
}

// --- Client-side upload restrictions ---

type UppyFileLike = { id: string; name?: string; type?: string; size?: number | null };

function fileMime(file: UppyFileLike): string {
	return inferMediaMimeType(String(file.name ?? ''), file.type);
}

function fileSize(file: UppyFileLike): number {
	return Number(file.size ?? 0);
}

/** Client-side per-file caps (30 MB images, 1 GB videos) and session batch cap. */
export function attachMediaUploadRestrictions(uppy: Uppy, onError?: (message: string) => void): void {
	uppy.setOptions({
		restrictions: {
			maxFileSize: MAX_MEDIA_VIDEO_UPLOAD_BYTES,
			allowedFileTypes: ['image/*', 'video/*']
		}
	});

	uppy.addPreProcessor((fileIds) => {
		return new Promise<void>((resolve, reject) => {
			const files = uppy.getFiles().filter((f) => fileIds.includes(f.id));
			let sessionTotal = 0;

			for (const file of files) {
				const size = fileSize(file);
				sessionTotal += size;
				const err = validateMediaFileUploadSize(size, fileMime(file), 'frontend');
				if (err) {
					onError?.(err);
					uppy.removeFile(file.id);
					reject(new Error(err));
					return;
				}
			}

			const sessionErr = validateMediaUploadSessionSize(sessionTotal);
			if (sessionErr) {
				onError?.(sessionErr);
				for (const file of files) {
					uppy.removeFile(file.id);
				}
				reject(new Error(sessionErr));
				return;
			}

			resolve();
		});
	});
}

/** Validate a file list before adding to Uppy (e.g. drag-drop without going through pre-processor alone). */
export function validateFilesForMediaUpload(
	files: File[],
	onError?: (message: string) => void
): File[] {
	const total = files.reduce((sum, f) => sum + f.size, 0);
	const sessionErr = validateMediaUploadSessionSize(total);
	if (sessionErr) {
		onError?.(sessionErr);
		return [];
	}

	const accepted: File[] = [];
	for (const file of files) {
		const err = validateMediaFileUploadSize(
			file.size,
			inferMediaMimeType(file.name, file.type),
			'frontend'
		);
		if (err) {
			onError?.(err);
			continue;
		}
		accepted.push(file);
	}
	return accepted;
}

// --- Workspace upload (composer, thumbnails, etc.) ---

/** S3-compatible multipart part size (minimum 5 MiB except the last part). */
const MULTIPART_PART_BYTES = 5 * 1024 * 1024;

export type MediaUploadProgress = {
	bytesUploaded: number;
	bytesTotal: number;
};

type WorkspaceMediaUploadOptions = {
	file: File;
	organizationId: string;
	virtualPath?: string;
	mode?: MediaLibraryUploadMode;
	onProgress?: (progress: MediaUploadProgress) => void;
};

function accessToken(): string | null {
	return authenticationRepository.getToken();
}

function uploadFailedMessage(error: unknown): string {
	if (error instanceof Error && error.message.trim()) {
		if (/failed to fetch/i.test(error.message)) {
			return 'Upload could not reach the server. Check your connection and try again.';
		}
		return error.message;
	}
	return 'Upload failed.';
}

async function uploadViaMultipartForm(params: {
	file: File;
	organizationId: string;
	virtualPath?: string;
	endpoint: string;
	fieldName: string;
	onProgress?: (progress: MediaUploadProgress) => void;
}): Promise<MediaUploadProgrammerModel> {
	const formData = new FormData();
	formData.append(params.fieldName, params.file);
	formData.append('organizationId', params.organizationId);
	if (params.virtualPath?.trim()) {
		formData.append('virtualPath', params.virtualPath.trim());
	}

	const token = accessToken();
	const url = mediaUploadApiUrl(params.endpoint);

	return new Promise((resolve) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', url);
		xhr.withCredentials = true;
		if (token) {
			xhr.setRequestHeader('Authorization', `Bearer ${token}`);
		}

		xhr.upload.addEventListener('progress', (event) => {
			if (!event.lengthComputable) return;
			params.onProgress?.({ bytesUploaded: event.loaded, bytesTotal: event.total });
		});

		xhr.addEventListener('load', () => {
			const json = (() => {
				try {
					return JSON.parse(xhr.responseText) as {
						success?: boolean;
						data?: { filePath?: string; publicUrl?: string };
						message?: string;
					};
				} catch {
					return null;
				}
			})();

			if (xhr.status < 200 || xhr.status >= 300 || !json?.success || !json.data?.filePath) {
				resolve({
					success: false,
					data: { filePath: '' },
					message: json?.message || `Upload failed (${xhr.status})`
				});
				return;
			}

			resolve({
				success: true,
				data: {
					filePath: json.data.filePath,
					...(json.data.publicUrl ? { publicUrl: json.data.publicUrl } : {})
				},
				message: json.message ?? 'Media uploaded successfully'
			});
		});

		xhr.addEventListener('error', () => {
			resolve({
				success: false,
				data: { filePath: '' },
				message: 'Upload could not reach the server. Check your connection and try again.'
			});
		});

		xhr.send(formData);
	});
}

async function uploadViaDirectR2Multipart(params: {
	file: File;
	organizationId: string;
	virtualPath?: string;
	onProgress?: (progress: MediaUploadProgress) => void;
}): Promise<MediaUploadProgrammerModel> {
	const token = accessToken();
	const contentType = inferMediaMimeType(params.file.name, params.file.type);

	const created = await postMediaUploadJson({
		path: '/api/v1/media/create-multipart-upload',
		token,
		body: {
			organizationId: params.organizationId,
			...(params.virtualPath?.trim() ? { virtualPath: params.virtualPath.trim() } : {}),
			file: { name: params.file.name, size: params.file.size, type: contentType },
			contentType,
			fileHash: ''
		}
	});

	const key = String(created.key ?? '');
	const uploadId = String(created.uploadId ?? '');
	if (!key || !uploadId) {
		return { success: false, data: { filePath: '' }, message: 'Upload could not start.' };
	}

	const completedParts: Array<{ PartNumber: number; ETag: string }> = [];
	let partNumber = 1;

	for (let offset = 0; offset < params.file.size; offset += MULTIPART_PART_BYTES) {
		const chunk = params.file.slice(offset, offset + MULTIPART_PART_BYTES);
		const signed = await postMediaUploadJson({
			path: '/api/v1/media/sign-part',
			token,
			body: {
				organizationId: params.organizationId,
				key,
				uploadId,
				partNumber
			}
		});
		const url = typeof signed.url === 'string' ? signed.url : '';
		if (!url) {
			return { success: false, data: { filePath: '' }, message: 'Upload could not sign part.' };
		}

		const putRes = await fetch(url, { method: 'PUT', body: chunk });
		if (!putRes.ok) {
			return {
				success: false,
				data: { filePath: '' },
				message: `Part upload failed (${putRes.status}).`
			};
		}

		const rawEtag = putRes.headers.get('ETag') ?? putRes.headers.get('etag') ?? '';
		const etag = rawEtag.replace(/^"+|"+$/g, '');
		if (!etag) {
			return { success: false, data: { filePath: '' }, message: 'Part upload missing ETag.' };
		}

		completedParts.push({ PartNumber: partNumber, ETag: etag });
		partNumber += 1;
		params.onProgress?.({ bytesUploaded: Math.min(offset + chunk.size, params.file.size), bytesTotal: params.file.size });
	}

	const completed = await postMediaUploadJson({
		path: '/api/v1/media/complete-multipart-upload',
		token,
		body: {
			organizationId: params.organizationId,
			...(params.virtualPath?.trim() ? { virtualPath: params.virtualPath.trim() } : {}),
			key,
			uploadId,
			parts: completedParts,
			file: { name: params.file.name, size: params.file.size, type: contentType },
			contentType
		}
	});

	const saved =
		completed.saved && typeof completed.saved === 'object'
			? (completed.saved as { path?: string; publicUrl?: string | null })
			: null;
	const filePath = (saved?.path ?? key).trim();
	if (!filePath) {
		return { success: false, data: { filePath: '' }, message: 'Upload did not return a path.' };
	}

	return {
		success: true,
		data: {
			filePath,
			...(saved?.publicUrl ? { publicUrl: saved.publicUrl } : {})
		},
		message: 'Media uploaded successfully'
	};
}

/**
 * Browser upload for workspace media (composer, thumbnails, etc.) using the same strategy
 * as the account media library (`VITE_MEDIA_LIBRARY_UPLOAD`).
 */
export async function uploadWorkspaceMediaFile(
	params: WorkspaceMediaUploadOptions
): Promise<MediaUploadProgrammerModel> {
	const mode = params.mode ?? resolveMediaLibraryUploadMode();

	try {
		if (mode === 'direct') {
			return await uploadViaDirectR2Multipart(params);
		}
		if (mode === 'local') {
			return await uploadViaMultipartForm({
				...params,
				endpoint: '/api/v1/media/upload-server',
				fieldName: 'file'
			});
		}
		return await uploadViaMultipartForm({
			...params,
			endpoint: '/api/v1/media/upload',
			fieldName: 'mediaFile'
		});
	} catch (error) {
		return {
			success: false,
			data: { filePath: '' },
			message: uploadFailedMessage(error)
		};
	}
}
