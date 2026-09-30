import { describe, expect, it } from 'vitest';

import { createYoutubeVideoObjectSchema } from '$lib/seo/createYoutubeVideoObjectSchema';

describe('createYoutubeVideoObjectSchema', () => {
	it('returns VideoObject with YouTube URLs and fragment id', () => {
		const node = createYoutubeVideoObjectSchema({
			youtubeVideoId: 'HhUhqtE_EYM',
			name: 'Connect a channel',
			description: 'Add Channel walkthrough',
			pageUrl: 'https://www.openquok.com/docs/channels/connect',
			uploadDate: '2026-09-30T00:00:00Z',
			fragmentId: 'connect-channels-video',
			isPartOfId: 'https://www.openquok.com/docs/channels/connect#techarticle'
		});

		expect(node).toMatchObject({
			'@type': 'VideoObject',
			'@id': 'https://www.openquok.com/docs/channels/connect#connect-channels-video',
			name: 'Connect a channel',
			contentUrl: 'https://www.youtube.com/watch?v=HhUhqtE_EYM',
			embedUrl: 'https://www.youtube.com/embed/HhUhqtE_EYM',
			isPartOf: { '@id': 'https://www.openquok.com/docs/channels/connect#techarticle' }
		});
	});

	it('returns empty object when uploadDate is missing', () => {
		expect(
			createYoutubeVideoObjectSchema({
				youtubeVideoId: 'abc',
				name: 'Title',
				description: 'Desc',
				pageUrl: 'https://www.openquok.com/',
				uploadDate: ''
			})
		).toEqual({});
	});
});
