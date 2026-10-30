import { describe, expect, it, vi, beforeEach } from 'vitest';

import { applySocialComposerDraftWithMedia } from './applySocialComposerDraftWithMedia.js';

const session = {
	apiOrigin: 'https://api.example.com',
	accessToken: 'token',
	organizationId: 'org-1',
	dashboardOrigin: 'https://www.openquok.com',
};

describe('applySocialComposerDraftWithMedia', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('passes through non-image drafts to body helper', async () => {
		const result = await applySocialComposerDraftWithMedia(session, {
			source: 'selection',
			body: 'Hello',
		});
		expect(result).toEqual({ body: 'Hello' });
	});

	it('queues image draft media for upload on submit', async () => {
		const result = await applySocialComposerDraftWithMedia(session, {
			source: 'image',
			body: 'Gallery',
			mediaUrl: 'https://cdn.example.com/photo.jpg',
		});

		expect(result.body).toBe('Gallery');
		expect(result.uploadedMedia?.pendingSourceUrl).toBe('https://cdn.example.com/photo.jpg');
		expect(result.uploadedMedia?.previewUrl).toBe('https://cdn.example.com/photo.jpg');
		expect(result.uploadedMedia?.id).toBeTruthy();
		expect(result.uploadedMedia?.mediaId).toBeUndefined();
	});

	it('falls back to URL in body when attachment limit is reached', async () => {
		const result = await applySocialComposerDraftWithMedia(
			session,
			{
				source: 'image',
				body: 'Gallery',
				mediaUrl: 'https://cdn.example.com/photo.jpg',
			},
			{ existingAttachmentCount: 10 }
		);

		expect(result.body).toBe('Gallery\n\nhttps://cdn.example.com/photo.jpg');
		expect(result.mediaUploadWarning).toContain('Maximum 10 attachments');
		expect(result.uploadedMedia).toBeUndefined();
	});
});
