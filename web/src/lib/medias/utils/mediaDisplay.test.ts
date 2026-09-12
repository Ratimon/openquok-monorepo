import { describe, expect, it } from 'vitest';

import { isVideoPreviewSource } from '$lib/medias/utils/mediaDisplay';

describe('isVideoPreviewSource', () => {
	it('detects video from public URL extension', () => {
		expect(isVideoPreviewSource('https://cdn.example/clip.mp4')).toBe(true);
		expect(isVideoPreviewSource('https://cdn.example/shot.png')).toBe(false);
	});

	it('detects video from composer storage path when preview URL is blob', () => {
		expect(
			isVideoPreviewSource('blob:http://localhost/abc-123', 'org/uuid/clip.mp4')
		).toBe(true);
		expect(
			isVideoPreviewSource('blob:http://localhost/abc-123', 'clip.mp4')
		).toBe(true);
		expect(
			isVideoPreviewSource('blob:http://localhost/abc-123', 'org/uuid/shot.png')
		).toBe(false);
	});

	it('ignores blob storage paths', () => {
		expect(isVideoPreviewSource('blob:http://localhost/abc-123', 'blob:legacy')).toBe(false);
	});
});
