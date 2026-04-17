import Uppy from '@uppy/core';
import Compressor from '@uppy/compressor';

import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { MAX_MEDIA_UPLOAD_BYTES } from '$lib/core/Media.repository.svelte';
import { normalizeApiBaseUrl } from '$lib/utils/path';
import { getUppyUploadPlugin } from '$lib/media/uppyUploadPluginFactory';

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
	provider?: 'local' | 'cloudflare' | 'r2' | 'transloadit';
	transloadit?: { key: string; templateId: string };
};

/**
 * Account media library uploader: XHR multipart to `/api/v1/media/upload`, optional image compression, Bearer auth.
 * The UI layer listens for Uppy events (`progress`, `upload-progress`, `file-added`, `complete`).
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

	uppy.use(Compressor, {
		quality: 0.85,
		maxWidth: 1920,
		maxHeight: 1920
	});

	// Default to direct-to-R2 multipart (original behavior).
	const provider = options.provider ?? 'cloudflare';

	const plugin = getUppyUploadPlugin({
		provider,
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
