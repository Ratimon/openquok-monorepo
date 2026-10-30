import { describe, expect, it, vi, beforeEach } from 'vitest';

import * as openquokSocialApi from './openquokSocialApi.js';
import { resolveComposerMediaAttachments } from './resolveComposerMediaAttachments.js';

const session = {
	apiOrigin: 'https://api.example.com',
	accessToken: 'token',
	organizationId: 'org-1',
	dashboardOrigin: 'https://www.openquok.com',
};

describe('resolveComposerMediaAttachments', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('reuses already-uploaded items', async () => {
		const result = await resolveComposerMediaAttachments(session, [
			{ id: 'client-1', mediaId: 'm1', path: '/org/m1.jpg', previewUrl: 'blob:x' },
		]);

		expect(result).toEqual({
			ok: true,
			items: [{ id: 'client-1', mediaId: 'm1', path: '/org/m1.jpg', previewUrl: 'blob:x' }],
			media: [{ id: 'm1', path: '/org/m1.jpg' }],
		});
	});

	it('uploads pending local files', async () => {
		const uploadSpy = vi.spyOn(openquokSocialApi, 'uploadComposerMediaFile').mockResolvedValue({
			ok: true,
			id: 'media-99',
			path: '/org/media-99.png',
		});

		const file = new File(['pixels'], 'shot.png', { type: 'image/png' });
		const result = await resolveComposerMediaAttachments(session, [
			{ id: 'client-2', previewUrl: 'blob:y', pendingFile: file },
		]);

		expect(uploadSpy).toHaveBeenCalledWith(session, file, { virtualPath: 'composer' });
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.media).toEqual([{ id: 'media-99', path: '/org/media-99.png' }]);
			expect(result.items[0].mediaId).toBe('media-99');
			expect(result.items[0].pendingFile).toBeUndefined();
		}
	});
});
