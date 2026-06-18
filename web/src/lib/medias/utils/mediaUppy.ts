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
import Uppy from '@uppy/core';
import Compressor from '@uppy/compressor';

import {
	attachMediaUploadRestrictions,
	mediaUploadApiUrl,
	postMediaUploadJson,
	resolveMediaLibraryUploadMode,
	type MediaLibraryUploadMode
} from '$lib/medias/utils/mediaUpload';

/** @see resolveMediaLibraryUploadMode — `transloadit` is opt-in only */
export type MediaLibraryUppyPluginMode = 'local' | 'direct' | 'api' | 'transloadit';

export type UploadPluginFactoryOptions = {
	mode: MediaLibraryUppyPluginMode;
	getAccessToken: () => string | null;
	/** Read on each request so uploads work after workspace loads (avoid mount-time empty string). */
	getOrganizationId: () => string;
	getVirtualPath?: () => string;
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
				endpoint: mediaUploadApiUrl('/api/v1/media/upload-server'),
				withCredentials: true,
				fieldName: 'file',
				metaFields: ['organizationId', 'virtualPath'],
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
				endpoint: mediaUploadApiUrl('/api/v1/media/upload'),
				withCredentials: true,
				fieldName: 'mediaFile',
				metaFields: ['organizationId', 'virtualPath'],
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
				const virtualPath = options.getVirtualPath?.();
				const dto = await postMediaUploadJson({
					path: '/api/v1/media/create-multipart-upload',
					token,
					body: {
						organizationId: options.getOrganizationId(),
						...(virtualPath?.trim() ? { virtualPath } : {}),
						file: { name: file.name, size: file.size, type: file.type },
						contentType: file.type || 'application/octet-stream',
						fileHash: ''
					}
				});
				return dto;
			},
			signPart: async (_file: any, p: any) => {
				const token = options.getAccessToken();
				const dto = await postMediaUploadJson({
					path: '/api/v1/media/sign-part',
					token,
					body: { organizationId: options.getOrganizationId(), key: p.key, uploadId: p.uploadId, partNumber: p.partNumber }
				});
				return { url: dto.url };
			},
			listParts: async (_file: any, p: any) => {
				const token = options.getAccessToken();
				const dto = await postMediaUploadJson({
					path: '/api/v1/media/list-parts',
					token,
					body: { organizationId: options.getOrganizationId(), key: p.key, uploadId: p.uploadId }
				});
				return dto;
			},
			abortMultipartUpload: async (_file: any, p: any) => {
				const token = options.getAccessToken();
				return await postMediaUploadJson({
					path: '/api/v1/media/abort-multipart-upload',
					token,
					body: { organizationId: options.getOrganizationId(), key: p.key, uploadId: p.uploadId }
				});
			},
			completeMultipartUpload: async (file: any, p: any) => {
				const token = options.getAccessToken();
				const virtualPath = options.getVirtualPath?.();
				const dto = await postMediaUploadJson({
					path: '/api/v1/media/complete-multipart-upload',
					token,
					body: {
						organizationId: options.getOrganizationId(),
						...(virtualPath?.trim() ? { virtualPath } : {}),
						key: p.key,
						uploadId: p.uploadId,
						parts: p.parts,
						file: { name: file.name, size: file.size, type: file.type },
						contentType: file.type || 'application/octet-stream'
					}
				});
				const saved =
					typeof dto.saved === 'object' && dto.saved !== null && !Array.isArray(dto.saved)
						? (dto.saved as Record<string, unknown>)
						: null;
				const location =
					(typeof dto.Location === 'string' ? dto.Location : null) ||
					(typeof dto.location === 'string' ? dto.location : null) ||
					(typeof saved?.publicUrl === 'string' ? saved.publicUrl : null);
				return location ? { location } : {};
			}
		}
	};
}

async function svgFileToPng(file: File): Promise<File> {
	const svgText = await file.text();
	const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
	const svgUrl = URL.createObjectURL(svgBlob);
	try {
		const img = new Image();
		img.decoding = 'async';
		img.src = svgUrl;
		await img.decode();

		const w = Math.max(1, Math.floor(img.naturalWidth || 0));
		const h = Math.max(1, Math.floor(img.naturalHeight || 0));
		if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 1 || h <= 1) {
			throw new Error('SVG has no intrinsic size');
		}

		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Canvas not available');
		ctx.drawImage(img, 0, 0, w, h);

		const pngBlob: Blob = await new Promise((resolve, reject) => {
			canvas.toBlob(
				(b) => (b ? resolve(b) : reject(new Error('PNG conversion failed'))),
				'image/png',
				1
			);
		});

		const base = file.name.replace(/\.svg$/i, '') || 'image';
		return new File([pngBlob], `${base}.png`, { type: 'image/png', lastModified: Date.now() });
	} finally {
		URL.revokeObjectURL(svgUrl);
	}
}

export type AccountMediaUppyOptions = {
	getAccessToken: () => string | null;
	onUploadError?: (error: Error) => void;
	/** Resolved on each API call (workspace may load after mount). */
	getOrganizationId: () => string;
	/** Virtual folder for new uploads (active File Manager directory). */
	getVirtualPath?: () => string;
	/**
	 * Upload strategy; defaults to {@link resolveMediaLibraryUploadMode} (`VITE_MEDIA_LIBRARY_UPLOAD`).
	 */
	mode?: MediaLibraryUploadMode;
	transloadit?: { key: string; templateId: string };
};

/**
 * Account media library uploader (Compressor + upload plugin from {@link resolveMediaLibraryUploadMode}).
 * The UI listens for Uppy events (`progress`, `upload-progress`, `file-added`, `complete`).
 */
export function createAccountMediaUppy(options: AccountMediaUppyOptions): Uppy {
	const uppy = new Uppy({
		id: 'account-media-library',
		autoProceed: true,
		onBeforeFileAdded: () => true
	});

	attachMediaUploadRestrictions(uppy, (message) => options.onUploadError?.(new Error(message)));

	uppy.on('file-added', async (file) => {
		const virtualPath = options.getVirtualPath?.();
		if (virtualPath?.trim()) {
			uppy.setFileMeta(file.id, { ...(file.meta ?? {}), virtualPath });
		}

		const type = String(file.type ?? '').toLowerCase();
		const name = String(file.name ?? '').toLowerCase();
		const isSvg = type.includes('svg') || name.endsWith('.svg');
		if (!isSvg || (file.meta as any)?.__oqSvgConverted === true) return;

		try {
			const png = await svgFileToPng(file.data as File);
			uppy.setFileState(file.id, {
				data: png,
				name: png.name,
				type: png.type,
				meta: { ...(file.meta ?? {}), __oqSvgConverted: true }
			});
		} catch (err) {
			options.onUploadError?.(err instanceof Error ? err : new Error(String(err)));
		}
	});

	uppy.use(Compressor, {
		quality: 0.85,
		maxWidth: 1920,
		maxHeight: 1920
	});

	const mode: MediaLibraryUppyPluginMode =
		options.transloadit?.key && options.transloadit?.templateId
			? 'transloadit'
			: (options.mode ?? resolveMediaLibraryUploadMode());

	const plugin = getUppyUploadPlugin({
		mode,
		getAccessToken: options.getAccessToken,
		getOrganizationId: options.getOrganizationId,
		getVirtualPath: options.getVirtualPath,
		transloadit: options.transloadit
	});

	uppy.use(plugin.plugin as typeof Compressor, plugin.options as Record<string, unknown>);

	uppy.on('upload-error', (_file, error) => {
		options.onUploadError?.(error as Error);
	});

	return uppy;
}
