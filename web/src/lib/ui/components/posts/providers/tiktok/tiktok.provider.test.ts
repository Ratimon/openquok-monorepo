import { describe, expect, it } from 'vitest';

import { classifyTiktokPreviewMediaMode } from '$lib/ui/components/posts/providers/tiktok/tiktok.provider';

describe('classifyTiktokPreviewMediaMode', () => {
	it('treats blob preview URLs as photo when storage paths are images', () => {
		expect(
			classifyTiktokPreviewMediaMode(
				['blob:https://localhost/1', 'blob:https://localhost/2'],
				['uploads/shot.png', 'uploads/doc.jpg']
			)
		).toBe('photo');
	});

	it('detects video from storage path even when preview URL is a blob', () => {
		expect(
			classifyTiktokPreviewMediaMode(['blob:https://localhost/clip'], ['uploads/clip.mp4'])
		).toBe('video');
	});

	it('detects video from public preview URL extension', () => {
		expect(
			classifyTiktokPreviewMediaMode(['https://cdn.example.com/org/reel.mov'], ['org/reel.mov'])
		).toBe('video');
	});

	it('returns empty when there is no media', () => {
		expect(classifyTiktokPreviewMediaMode([], [])).toBe('empty');
	});
});
