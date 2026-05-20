import type Uppy from '@uppy/core';
import {
	MAX_MEDIA_VIDEO_UPLOAD_BYTES,
	validateMediaFileUploadSize,
	validateMediaUploadSessionSize
} from 'openquok-common';

type UppyFileLike = { id: string; name?: string; type?: string; size?: number | null };

function fileMime(file: UppyFileLike): string {
	return String(file.type ?? '');
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
		const err = validateMediaFileUploadSize(file.size, file.type, 'frontend');
		if (err) {
			onError?.(err);
			continue;
		}
		accepted.push(file);
	}
	return accepted;
}
