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
