import { describe, expect, it } from 'vitest';

import {
	BLUESKY_MAX_IMAGES,
	checkBlueskyLaunchValidity,
	classifyBlueskyPreviewMediaMode
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
});
