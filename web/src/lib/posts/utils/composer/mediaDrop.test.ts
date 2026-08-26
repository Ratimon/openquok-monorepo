import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	attachComposerMediaFromLocalFiles,
	isComposerMediaFile,
	postMediaPreviewUrls,
	revokeLocalMediaPreviewUrl,
	revokeLocalMediaPreviewUrls
} from '$lib/posts/utils/composer/mediaDrop';

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('attachComposerMediaFromLocalFiles', () => {
	it('builds blob preview items without uploading', () => {
		const createObjectURL = vi.fn((file: File) => `blob:local/${file.name}`);
		vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() });

		const image = new File(['img'], 'shot.png', { type: 'image/png' });
		const video = new File(['vid'], 'clip.mp4', { type: 'video/mp4' });
		const result = attachComposerMediaFromLocalFiles({ files: [image, video] });

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(createObjectURL).toHaveBeenCalledTimes(2);
		expect(result.items).toHaveLength(2);
		expect(result.items[0]?.path).toBe('shot.png');
		expect(result.items[0]?.localPreviewUrl).toBe('blob:local/shot.png');
		expect(result.items[1]?.path).toBe('clip.mp4');
		expect(result.items[1]?.localPreviewUrl).toBe('blob:local/clip.mp4');
		expect(result.items.every((item) => item.bucket === undefined)).toBe(true);
	});

	it('rejects non-media files', () => {
		vi.stubGlobal('URL', { createObjectURL: vi.fn(), revokeObjectURL: vi.fn() });
		const result = attachComposerMediaFromLocalFiles({
			files: [new File(['nope'], 'notes.txt', { type: 'text/plain' })]
		});
		expect(result).toEqual({ ok: false, message: 'Add image or video files only.' });
	});
});

describe('isComposerMediaFile', () => {
	it('accepts image and video mime types', () => {
		expect(isComposerMediaFile(new File(['x'], 'a.png', { type: 'image/png' }))).toBe(true);
		expect(isComposerMediaFile(new File(['x'], 'b.mp4', { type: 'video/mp4' }))).toBe(true);
		expect(isComposerMediaFile(new File(['x'], 'c.txt', { type: 'text/plain' }))).toBe(false);
	});
});

describe('postMediaPreviewUrls', () => {
	it('prefers localPreviewUrl over storage paths', () => {
		expect(
			postMediaPreviewUrls([
				{ id: '1', path: 'users/abc/shot.png', localPreviewUrl: 'blob:guest/1' },
				{ id: '2', path: 'blob:legacy/2' }
			])
		).toEqual(['blob:guest/1', 'blob:legacy/2']);
	});
});

describe('revokeLocalMediaPreviewUrl', () => {
	it('revokes blob URLs and ignores others', () => {
		const revokeObjectURL = vi.fn();
		vi.stubGlobal('URL', { createObjectURL: vi.fn(), revokeObjectURL });
		revokeLocalMediaPreviewUrl('blob:guest/1');
		revokeLocalMediaPreviewUrl('https://cdn.example/shot.png');
		revokeLocalMediaPreviewUrls([
			{ id: '1', path: 'clip.mp4', localPreviewUrl: 'blob:guest/2' },
			{ id: '2', path: 'shot.png' }
		]);
		expect(revokeObjectURL).toHaveBeenCalledTimes(2);
		expect(revokeObjectURL).toHaveBeenNthCalledWith(1, 'blob:guest/1');
		expect(revokeObjectURL).toHaveBeenNthCalledWith(2, 'blob:guest/2');
	});
});
