import { describe, expect, it } from 'vitest';

import { classifyInstagramPreviewMediaMode } from '$lib/ui/components/posts/providers/instagram/instagram.provider';

describe('classifyInstagramPreviewMediaMode', () => {
	it('treats blob preview URLs as photo when storage paths are images', () => {
		expect(
			classifyInstagramPreviewMediaMode(
				['blob:https://localhost/1'],
				['users/org/social_media/shot.png']
			)
		).toBe('photo');
	});

	it('detects video from storage path even when preview URL is a blob', () => {
		expect(
			classifyInstagramPreviewMediaMode(
				['blob:https://localhost/clip'],
				['users/org/social_media/clip.mp4']
			)
		).toBe('video');
	});

	it('returns empty when there is no media', () => {
		expect(classifyInstagramPreviewMediaMode([], [])).toBe('empty');
	});
});
