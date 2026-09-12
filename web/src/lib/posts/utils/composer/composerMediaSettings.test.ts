import { describe, expect, it } from 'vitest';

import {
	applyComposerMediaDetailsSave,
	composerMediaItemSupportsSettings,
	composerMediaPlaybackUrl,
	isGuestOnlyComposerMedia,
	mergeLibraryVmIntoPostMedia
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

describe('composerMediaPlaybackUrl', () => {
	it('prefers local blob over API public URL for thumbnail scrubbing', () => {
		expect(
			composerMediaPlaybackUrl({
				id: '1',
				path: 'org/clip.mp4',
				localPreviewUrl: 'blob:http://localhost/video',
				publicUrl: 'https://cdn.example/clip.mp4'
			})
		).toBe('blob:http://localhost/video');
	});
});

describe('applyComposerMediaDetailsSave', () => {
	it('stores session poster blob and public URL from save patch', () => {
		expect(
			applyComposerMediaDetailsSave(
				{
					id: '1',
					path: 'org/clip.mp4',
					localPreviewUrl: 'blob:http://localhost/video'
				},
				{
					alt: 'demo',
					thumbnail: 'org/poster.jpg',
					thumbnailPublicUrl: 'https://cdn.example/poster.jpg',
					thumbnailLocalPreviewUrl: 'blob:http://localhost/poster',
					thumbnailTimestamp: 1200
				}
			)
		).toMatchObject({
			alt: 'demo',
			thumbnail: 'org/poster.jpg',
			thumbnailPublicUrl: 'https://cdn.example/poster.jpg',
			thumbnailLocalPreviewUrl: 'blob:http://localhost/poster',
			thumbnailTimestamp: 1200,
			localPreviewUrl: 'blob:http://localhost/video'
		});
	});
});

describe('mergeLibraryVmIntoPostMedia', () => {
	it('does not persist blob URLs as publicUrl', () => {
		expect(
			mergeLibraryVmIntoPostMedia(
				{
					id: '1',
					path: 'org/clip.mp4',
					localPreviewUrl: 'blob:http://localhost/video',
					publicUrl: 'https://cdn.example/clip.mp4'
				},
				{
					id: 'lib-1',
					path: 'org/clip.mp4',
					name: 'clip.mp4',
					size: 0,
					lastModified: null,
					publicUrl: 'blob:http://localhost/video',
					kind: 'video',
					alt: null,
					thumbnail: 'org/poster.jpg',
					thumbnailPublicUrl: 'https://cdn.example/poster.jpg',
					thumbnailTimestamp: 1000
				}
			)
		).toMatchObject({
			thumbnail: 'org/poster.jpg',
			thumbnailPublicUrl: 'https://cdn.example/poster.jpg',
			publicUrl: 'https://cdn.example/clip.mp4'
		});
	});

	it('keeps session poster blob when library refresh omits it', () => {
		expect(
			mergeLibraryVmIntoPostMedia(
				{
					id: '1',
					path: 'org/clip.mp4',
					thumbnail: 'org/poster.jpg',
					thumbnailLocalPreviewUrl: 'blob:http://localhost/poster',
					thumbnailPublicUrl: 'https://cdn.example/poster.jpg'
				},
				{
					id: 'lib-1',
					path: 'org/clip.mp4',
					name: 'clip.mp4',
					size: 0,
					lastModified: null,
					publicUrl: 'https://cdn.example/clip.mp4',
					kind: 'video',
					alt: null,
					thumbnail: 'org/poster.jpg',
					thumbnailPublicUrl: null,
					thumbnailTimestamp: 1000
				}
			)
		).toMatchObject({
			thumbnailLocalPreviewUrl: 'blob:http://localhost/poster',
			thumbnailPublicUrl: 'https://cdn.example/poster.jpg'
		});
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
