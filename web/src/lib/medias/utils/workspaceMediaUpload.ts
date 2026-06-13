import type { MediaUploadProgrammerModel } from '$lib/medias/Media.repository.svelte';
import { authenticationRepository } from '$lib/user-auth/index';
import { mediaUploadApiUrl, postMediaUploadJson } from '$lib/medias/utils/mediaUploadApi';
import type { MediaLibraryUploadMode } from '$lib/medias/utils/mediaLibraryUploadEnv';
import { resolveMediaLibraryUploadMode } from '$lib/medias/utils/mediaLibraryUploadEnv';

/** S3-compatible multipart part size (minimum 5 MiB except the last part). */
const MULTIPART_PART_BYTES = 5 * 1024 * 1024;

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
}): Promise<MediaUploadProgrammerModel> {
	const formData = new FormData();
	formData.append(params.fieldName, params.file);
	formData.append('organizationId', params.organizationId);
	if (params.virtualPath?.trim()) {
		formData.append('virtualPath', params.virtualPath.trim());
	}

	const token = accessToken();
	const res = await fetch(mediaUploadApiUrl(params.endpoint), {
		method: 'POST',
		credentials: 'include',
		headers: token ? { Authorization: `Bearer ${token}` } : {},
		body: formData
	});

	const json = (await res.json().catch(() => null)) as {
		success?: boolean;
		data?: { filePath?: string; publicUrl?: string };
		message?: string;
	} | null;

	if (!res.ok || !json?.success || !json.data?.filePath) {
		return {
			success: false,
			data: { filePath: '' },
			message: json?.message || `Upload failed (${res.status})`
		};
	}

	return {
		success: true,
		data: {
			filePath: json.data.filePath,
			...(json.data.publicUrl ? { publicUrl: json.data.publicUrl } : {})
		},
		message: json.message ?? 'Media uploaded successfully'
	};
}

async function uploadViaDirectR2Multipart(params: {
	file: File;
	organizationId: string;
	virtualPath?: string;
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
export async function uploadWorkspaceMediaFile(params: {
	file: File;
	organizationId: string;
	virtualPath?: string;
	mode?: MediaLibraryUploadMode;
}): Promise<MediaUploadProgrammerModel> {
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
