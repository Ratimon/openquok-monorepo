import type { MediaUploadProgrammerModel } from '$lib/medias/Media.repository.svelte';
import { authenticationRepository } from '$lib/user-auth/index';
import { mediaUploadApiUrl, postMediaUploadJson } from '$lib/medias/utils/mediaUploadApi';
import type { MediaLibraryUploadMode } from '$lib/medias/utils/mediaLibraryUploadEnv';
import { resolveMediaLibraryUploadMode } from '$lib/medias/utils/mediaLibraryUploadEnv';

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
	const contentType = params.file.type || 'application/octet-stream';

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
