import type { SocialComposerMediaItem } from './openquokSocialApi.js';
import { MAX_COMPOSER_MEDIA_ATTACHMENTS } from './composerMediaFile.js';
import {
	applySocialComposerDraftToBody,
	type SocialComposerDraftInput,
} from './sessionDraftStorage.js';

export type ApplySocialComposerDraftWithMediaResult = {
	body: string;
	uploadedMedia?: SocialComposerMediaItem;
	mediaUploadWarning?: string;
};

export type ApplySocialComposerDraftWithMediaOptions = {
	existingAttachmentCount?: number;
};

function newPendingMediaId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Applies a context-menu draft: for image shares, queues the media URL for upload on submit
 * instead of pasting the URL into the post body.
 */
export async function applySocialComposerDraftWithMedia(
	_draftSession: unknown,
	draft: SocialComposerDraftInput,
	opts?: ApplySocialComposerDraftWithMediaOptions
): Promise<ApplySocialComposerDraftWithMediaResult> {
	const mediaUrl = draft.mediaUrl?.trim();
	if (draft.source !== 'image' || !mediaUrl) {
		return { body: applySocialComposerDraftToBody(draft) };
	}

	const body = draft.body.trim();
	const existingCount = opts?.existingAttachmentCount ?? 0;
	if (existingCount >= MAX_COMPOSER_MEDIA_ATTACHMENTS) {
		return {
			body: applySocialComposerDraftToBody(draft),
			mediaUploadWarning: `Maximum ${MAX_COMPOSER_MEDIA_ATTACHMENTS} attachments. The image URL was added to the post text instead.`,
		};
	}

	return {
		body,
		uploadedMedia: {
			id: newPendingMediaId(),
			previewUrl: mediaUrl,
			pendingSourceUrl: mediaUrl,
		},
	};
}
