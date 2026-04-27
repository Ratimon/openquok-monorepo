import Uppy from '@uppy/core';
import Compressor from '@uppy/compressor';

import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { MAX_MEDIA_UPLOAD_BYTES } from '$lib/media';
import { normalizeApiBaseUrl } from '$lib/utils/path';
import {
	getUppyUploadPlugin,
	type MediaLibraryUppyPluginMode
} from '$lib/media/utils/uppyUploadPluginFactory';
import {
	resolveMediaLibraryUploadMode,
	type MediaLibraryUploadMode
} from '$lib/media/utils/mediaLibraryUploadEnv';

async function svgFileToPng(file: File): Promise<File> {
	const svgText = await file.text();
	const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
	const svgUrl = URL.createObjectURL(svgBlob);
	try {
		const img = new Image();
		// Inline SVG only; keep it simple + safe for our use (user-provided assets).
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

/** Full URL for `POST` multipart field `mediaFile` (same origin as `HttpGateway`). */
export function buildMediaUploadEndpointUrl(): string {
	const raw = String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? '');
	const base = normalizeApiBaseUrl(raw);
	const path = '/api/v1/media/upload';
	if (!base) return path;
	return `${base}${path}`;
}

export type AccountMediaUppyOptions = {
	getAccessToken: () => string | null;
	onUploadError?: (error: Error) => void;
	/** Resolved on each API call (workspace may load after mount). */
	getOrganizationId: () => string;
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
		restrictions: {
			maxFileSize: MAX_MEDIA_UPLOAD_BYTES,
			allowedFileTypes: ['image/*', 'video/*']
		}
	});

	// Threads/Meta rejects SVG media fetches. Convert SVG → PNG at ingestion time so downstream
	// providers always see a supported raster format (and so the stored object key isn't .svg).
	uppy.on('file-added', async (file) => {
		const type = String(file.type ?? '').toLowerCase();
		const name = String(file.name ?? '').toLowerCase();
		const isSvg = type.includes('svg') || name.endsWith('.svg');
		// Avoid re-processing if we already converted this file.
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
			// Keep original file and let the backend/provider surface a useful error.
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
		transloadit: options.transloadit
	});

	// Dynamic plugin (XHR, AwsS3Multipart, or Transloadit); Uppy generics cannot express this union.
	uppy.use(plugin.plugin as typeof Compressor, plugin.options as Record<string, unknown>);

	uppy.on('upload-error', (_file, error) => {
		options.onUploadError?.(error as Error);
	});

	return uppy;
}
