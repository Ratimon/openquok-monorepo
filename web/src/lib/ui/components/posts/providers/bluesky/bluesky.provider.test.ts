import { describe, expect, it } from 'vitest';

import {
	BLUESKY_MAX_IMAGES,
	BLUESKY_MAX_VIDEO_BYTES,
	blueskyVideoByteSizeError,
	checkBlueskyLaunchValidity,
	classifyBlueskyPreviewMediaMode,
	readBlueskyLaunchSettings
} from '$lib/ui/components/posts/providers/bluesky/bluesky.provider';

describe('classifyBlueskyPreviewMediaMode', () => {
	it('treats blob preview URLs as photo when storage paths are images', () => {
		expect(
			classifyBlueskyPreviewMediaMode(
				['blob:https://localhost/1'],
				['uploads/shot.png']
			)
		).toBe('photo');
	});

	it('detects video from storage path when preview URL is a blob', () => {
		expect(
			classifyBlueskyPreviewMediaMode(['blob:https://localhost/clip'], ['uploads/clip.mp4'])
		).toBe('video');
	});

	it('returns empty when there is no media', () => {
		expect(classifyBlueskyPreviewMediaMode([], [])).toBe('empty');
	});
});

describe('checkBlueskyLaunchValidity', () => {
	it('rejects mixed image and video', () => {
		expect(
			checkBlueskyLaunchValidity({
				settings: {},
				media: [{ path: 'a.png' }, { path: 'b.mp4' }]
			})
		).toMatch(/mixing/i);
	});

	it('rejects more than four images', () => {
		const media = Array.from({ length: BLUESKY_MAX_IMAGES + 1 }, (_, i) => ({
			path: `uploads/${i}.jpg`
		}));
		expect(
			checkBlueskyLaunchValidity({
				settings: {},
				media
			})
		).toMatch(/4 images/i);
	});

	it('allows text-only posts', () => {
		expect(checkBlueskyLaunchValidity({ settings: {}, media: [] })).toBe(true);
	});

	it('rejects oversized MP4 when byteSize is known', () => {
		expect(
			checkBlueskyLaunchValidity({
				settings: {},
				media: [{ id: '1', path: 'clip.mp4', byteSize: BLUESKY_MAX_VIDEO_BYTES + 1 }]
			})
		).toMatch(/300 MB/);
	});

	it('allows MP4 within size cap when byteSize is known', () => {
		expect(
			checkBlueskyLaunchValidity({
				settings: {},
				media: [{ id: '1', path: 'clip.mp4', byteSize: BLUESKY_MAX_VIDEO_BYTES }]
			})
		).toBe(true);
	});

	it('accepts link card URLs without a scheme after normalization', () => {
		expect(
			checkBlueskyLaunchValidity({
				settings: { bluesky: { linkUrl: 'www.example.com/article' } },
				media: []
			})
		).toBe(true);
	});

	it('accepts link card URLs with a scheme missing slashes', () => {
		expect(
			checkBlueskyLaunchValidity({
				settings: { bluesky: { linkUrl: 'https:www.example.com/article' } },
				media: []
			})
		).toBe(true);
	});

	it('rejects link cards with media', () => {
		expect(
			checkBlueskyLaunchValidity({
				settings: { bluesky: { linkUrl: 'https://example.com' } },
				media: [{ path: 'a.png' }]
			})
		).toMatch(/link cards/i);
	});
});

describe('blueskyVideoByteSizeError', () => {
	it('returns null within the cap', () => {
		expect(blueskyVideoByteSizeError(BLUESKY_MAX_VIDEO_BYTES)).toBeNull();
	});
});

describe('readBlueskyLaunchSettings', () => {
	it('reads nested bluesky bucket fields', () => {
		expect(
			readBlueskyLaunchSettings({
				bluesky: {
					quoteUrl: 'https://bsky.app/profile/alice/post/abc',
					threadGate: 'followers'
				}
			})
		).toEqual({
			quoteUrl: 'https://bsky.app/profile/alice/post/abc',
			threadGate: 'followers'
		});
	});
});
