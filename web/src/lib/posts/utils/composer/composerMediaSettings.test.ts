import { describe, expect, it } from 'vitest';

import {
	composerMediaItemSupportsSettings,
	isGuestOnlyComposerMedia
} from '$lib/posts/utils/composer/composerMediaSettings';

describe('isGuestOnlyComposerMedia', () => {
	it('is true for guest blob attachments without a storage path', () => {
		expect(
			isGuestOnlyComposerMedia({
				id: '1',
				path: 'photo.jpg',
				localPreviewUrl: 'blob:guest/1'
			})
		).toBe(true);
	});

	it('is false for workspace uploads that keep a blob preview URL', () => {
		expect(
			isGuestOnlyComposerMedia({
				id: '1',
				path: 'users/org/social_media/photo.jpg',
				localPreviewUrl: 'blob:session/1',
				publicUrl: 'https://cdn.example/photo.jpg'
			})
		).toBe(false);
	});
});

describe('composerMediaItemSupportsSettings', () => {
	it('allows settings for uploaded composer images with blob previews', () => {
		expect(
			composerMediaItemSupportsSettings({
				id: '1',
				path: 'users/org/social_media/photo.jpg',
				localPreviewUrl: 'blob:session/1'
			})
		).toBe(true);
	});

	it('blocks guest-only local attachments', () => {
		expect(
			composerMediaItemSupportsSettings({
				id: '1',
				path: 'photo.jpg',
				localPreviewUrl: 'blob:guest/1'
			})
		).toBe(false);
	});
});
