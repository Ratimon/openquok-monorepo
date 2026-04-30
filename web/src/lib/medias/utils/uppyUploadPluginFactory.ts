// These are installed at runtime (pnpm install). Types may not exist until installed.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AwsS3Multipart from '@uppy/aws-s3';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Transloadit from '@uppy/transloadit';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import XHRUpload from '@uppy/xhr-upload';

import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

/** @see resolveMediaLibraryUploadMode — `transloadit` is opt-in only */
export type MediaLibraryUppyPluginMode = 'local' | 'direct' | 'api' | 'transloadit';

function apiBaseUrl(): string {
	const raw = String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? '');
	return normalizeApiBaseUrl(raw);
}

function apiUrl(path: string): string {
	const base = apiBaseUrl();
	const p = path.startsWith('/') ? path : `/${path}`;
	return base ? `${base}${p}` : p;
}

async function postJson(params: {
	path: string;
	token: string | null;
	body: unknown;
}): Promise<any> {
	const res = await fetch(apiUrl(params.path), {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(params.token ? { Authorization: `Bearer ${params.token}` } : {})
		},
		credentials: 'include',
		body: JSON.stringify(params.body)
	});
	const json = (await res.json().catch(() => null)) as any;
	if (!res.ok) {
		const msg = json?.message || json?.msg || `Request failed with status ${res.status}`;
		throw new Error(msg);
	}
	return json;
}

export type UploadPluginFactoryOptions = {
	mode: MediaLibraryUppyPluginMode;
	getAccessToken: () => string | null;
	/** Read on each request so uploads work after workspace loads (avoid mount-time empty string). */
	getOrganizationId: () => string;
	transloadit?: { key: string; templateId: string };
};

/**
 * - `local`: XHR to `/api/v1/media/upload-server` (disk via API)
 * - `api`: XHR multipart to `/api/v1/media/upload` (full file through API; no R2 CORS in browser)
 * - `direct`: AwsS3Multipart to R2 using presigned part URLs (requires bucket CORS)
 * - `transloadit`: Transloadit plugin (assemblies)
 */
export function getUppyUploadPlugin(options: UploadPluginFactoryOptions): {
	plugin: any;
	options: Record<string, unknown>;
} {
	if (options.mode === 'transloadit') {
		if (!options.transloadit?.key || !options.transloadit?.templateId) {
			throw new Error('Transloadit is enabled but key/templateId is missing.');
		}
		return {
			plugin: Transloadit,
			options: {
				waitForEncoding: true,
				alwaysRunAssembly: true,
				assemblyOptions: {
					params: {
						auth: { key: options.transloadit.key },
						template_id: options.transloadit.templateId
					}
				}
			}
		};
	}

	if (options.mode === 'local') {
		return {
			plugin: XHRUpload,
			options: {
				endpoint: apiUrl('/api/v1/media/upload-server'),
				withCredentials: true,
				fieldName: 'file',
				headers: () => {
					const token = options.getAccessToken();
					return token ? { Authorization: `Bearer ${token}` } : {};
				}
			}
		};
	}

	if (options.mode === 'api') {
		return {
			plugin: XHRUpload,
			options: {
				endpoint: apiUrl('/api/v1/media/upload'),
				withCredentials: true,
				fieldName: 'mediaFile',
				headers: () => {
					const token = options.getAccessToken();
					return token ? { Authorization: `Bearer ${token}` } : {};
				}
			}
		};
	}

	// direct: multipart to R2 (requires bucket CORS)
	return {
		plugin: AwsS3Multipart,
		options: {
			shouldUseMultipart: (_file: any) => true,
			createMultipartUpload: async (file: any) => {
				const token = options.getAccessToken();
				const dto = await postJson({
					path: '/api/v1/media/create-multipart-upload',
					token,
					body: {
						organizationId: options.getOrganizationId(),
						file: { name: file.name, size: file.size, type: file.type },
						contentType: file.type || 'application/octet-stream',
						fileHash: ''
					}
				});
				// backend returns { uploadId, key }
				return dto;
			},
			signPart: async (_file: any, p: any) => {
				const token = options.getAccessToken();
				const dto = await postJson({
					path: '/api/v1/media/sign-part',
					token,
					body: { organizationId: options.getOrganizationId(), key: p.key, uploadId: p.uploadId, partNumber: p.partNumber }
				});
				// expected { url }
				return { url: dto.url };
			},
			listParts: async (_file: any, p: any) => {
				const token = options.getAccessToken();
				const dto = await postJson({
					path: '/api/v1/media/list-parts',
					token,
					body: { organizationId: options.getOrganizationId(), key: p.key, uploadId: p.uploadId }
				});
				return dto;
			},
			abortMultipartUpload: async (_file: any, p: any) => {
				const token = options.getAccessToken();
				return await postJson({
					path: '/api/v1/media/abort-multipart-upload',
					token,
					body: { organizationId: options.getOrganizationId(), key: p.key, uploadId: p.uploadId }
				});
			},
			completeMultipartUpload: async (file: any, p: any) => {
				const token = options.getAccessToken();
				const dto = await postJson({
					path: '/api/v1/media/complete-multipart-upload',
					token,
					body: {
						organizationId: options.getOrganizationId(),
						key: p.key,
						uploadId: p.uploadId,
						parts: p.parts,
						file: { name: file.name, size: file.size, type: file.type },
						contentType: file.type || 'application/octet-stream'
					}
				});
				const location = (dto?.Location || dto?.location || dto?.saved?.publicUrl || null) as string | null;
				return location ? { location } : {};
			}
		}
	};
}

