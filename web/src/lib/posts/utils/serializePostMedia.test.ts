import { describe, expect, it } from 'vitest';

import type { PostMediaProgrammerModel } from '$lib/posts/Post.repository.svelte';
import { serializePostMediaItemForApi } from '$lib/posts/utils/serializePostMedia';

describe('serializePostMediaItemForApi', () => {
	it('strips client-only preview fields and keeps persisted metadata', () => {
		const item: PostMediaProgrammerModel = {
			id: 'm1',
			path: 'social_media/org/reel.mp4',
			bucket: 'social_media',
			localPreviewUrl: 'blob:guest/preview',
			thumbnailPublicUrl: 'https://cdn.example/poster.jpg',
			alt: 'Launch reel',
			thumbnail: 'social_media/org/poster.jpg',
			thumbnailTimestamp: 2
		};
		expect(serializePostMediaItemForApi(item)).toEqual({
			id: 'm1',
			path: 'social_media/org/reel.mp4',
			bucket: 'social_media',
			alt: 'Launch reel',
			thumbnail: 'social_media/org/poster.jpg',
			thumbnailTimestamp: 2
		});
	});
});
