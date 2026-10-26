import { inferMediaMimeType, validateMediaFileUploadSize } from 'openquok-common';

import { fetchComposerMediaFileFromUrl } from './fetchComposerMediaFromUrl.js';
import {
	type ComposerMediaUploadResult,
	type SocialApiFailure,
	type SocialComposerMediaItem,
	type SocialSessionContext,
	uploadComposerMediaFile,
} from './openquokSocialApi.js';

export type ResolveComposerMediaResult =
	| { ok: true; items: SocialComposerMediaItem[]; media: { id: string; path: string }[] }
	| SocialApiFailure;

function isUploaded(item: SocialComposerMediaItem): boolean {
	return Boolean(item.mediaId?.trim() && item.path?.trim());
}

async function fileForPendingItem(
	item: SocialComposerMediaItem
): Promise<{ ok: true; file: File } | SocialApiFailure> {
	if (item.pendingFile) {
		return { ok: true, file: item.pendingFile };
	}
	const sourceUrl = item.pendingSourceUrl?.trim();
	if (sourceUrl) {
		const fetched = await fetchComposerMediaFileFromUrl(sourceUrl);
		if (!fetched.ok) {
			return { ok: false, error: fetched.error };
		}
		return { ok: true, file: fetched.file };
	}
	return { ok: false, error: 'Attachment is missing file data.' };
}

/**
 * Uploads any pending local / remote attachments and returns post-ready `media` payloads.
 * Already-uploaded items (from a prior partial submit) are reused.
 */
export async function resolveComposerMediaAttachments(
	session: SocialSessionContext,
	items: SocialComposerMediaItem[]
): Promise<ResolveComposerMediaResult> {
	const nextItems: SocialComposerMediaItem[] = [];
	const media: { id: string; path: string }[] = [];

	for (const item of items) {
		if (isUploaded(item)) {
			nextItems.push(item);
			media.push({ id: item.mediaId!, path: item.path! });
			continue;
		}

		const fileResult = await fileForPendingItem(item);
		if (!fileResult.ok) {
			return fileResult;
		}
		const file = fileResult.file;
		const mime = inferMediaMimeType(file.name, file.type);
		const sizeError = validateMediaFileUploadSize(file.size, mime, 'frontend');
		if (sizeError) {
			return { ok: false, error: `${file.name}: ${sizeError}` };
		}

		const upload: ComposerMediaUploadResult = await uploadComposerMediaFile(session, file, {
			virtualPath: 'composer',
		});
		if (!upload.ok) {
			return upload;
		}

		const resolved: SocialComposerMediaItem = {
			id: item.id,
			mediaId: upload.id,
			path: upload.path,
			previewUrl: item.previewUrl ?? upload.publicUrl,
			pendingFile: undefined,
			pendingSourceUrl: undefined,
		};
		nextItems.push(resolved);
		media.push({ id: upload.id, path: upload.path });
	}

	return { ok: true, items: nextItems, media };
}
