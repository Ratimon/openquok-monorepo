export type ComposerMediaUploadProgress = {
	bytesUploaded: number;
	bytesTotal: number;
};

export type ComposerMediaUploadResult =
	| { ok: true; id: string; path: string; publicUrl?: string }
	| { ok: false; error: string };

function mediaUploadApiUrl(apiOrigin: string): string {
	return `${apiOrigin.replace(/\/+$/, '')}/api/v1/media/upload`;
}

function parseUploadJson(responseText: string): {
	success?: boolean;
	data?: { id?: string; filePath?: string; publicUrl?: string };
	message?: string;
} | null {
	try {
		return JSON.parse(responseText) as {
			success?: boolean;
			data?: { id?: string; filePath?: string; publicUrl?: string };
			message?: string;
		};
	} catch {
		return null;
	}
}

function messageFromUploadJson(json: ReturnType<typeof parseUploadJson>, status: number): string {
	if (json?.message && typeof json.message === 'string') return json.message;
	return `Upload failed (${status}).`;
}

/**
 * Session multipart upload to `POST /api/v1/media/upload` (`mediaFile` field).
 * Uses XHR so callers can report upload progress.
 */
export function uploadComposerMediaMultipart(
	apiOrigin: string,
	accessToken: string,
	organizationId: string,
	file: File,
	opts?: { virtualPath?: string; onProgress?: (progress: ComposerMediaUploadProgress) => void }
): Promise<ComposerMediaUploadResult> {
	const formData = new FormData();
	formData.append('mediaFile', file);
	formData.append('organizationId', organizationId);
	if (opts?.virtualPath?.trim()) {
		formData.append('virtualPath', opts.virtualPath.trim());
	}

	const url = mediaUploadApiUrl(apiOrigin);

	return new Promise((resolve) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', url);
		xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

		xhr.upload.addEventListener('progress', (event) => {
			if (!event.lengthComputable || !opts?.onProgress) return;
			opts.onProgress({ bytesUploaded: event.loaded, bytesTotal: event.total });
		});

		xhr.addEventListener('load', () => {
			const json = parseUploadJson(xhr.responseText);
			const filePath = json?.data?.filePath;
			const id = json?.data?.id;

			if (xhr.status < 200 || xhr.status >= 300 || json?.success === false || !filePath?.trim()) {
				resolve({
					ok: false,
					error: messageFromUploadJson(json, xhr.status),
				});
				return;
			}

			if (!id || typeof id !== 'string' || !id.trim()) {
				resolve({ ok: false, error: 'Upload succeeded but media id was missing.' });
				return;
			}

			const publicUrl =
				typeof json.data?.publicUrl === 'string' && json.data.publicUrl.trim()
					? json.data.publicUrl.trim()
					: undefined;

			resolve({
				ok: true,
				id: id.trim(),
				path: filePath.trim(),
				...(publicUrl ? { publicUrl } : {}),
			});
		});

		xhr.addEventListener('error', () => {
			resolve({
				ok: false,
				error: 'Upload could not reach the server. Check your connection and try again.',
			});
		});

		xhr.send(formData);
	});
}
