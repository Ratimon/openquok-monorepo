import { describe, expect, it } from 'vitest';

import {
	mockBlueskyLinkCardDescription,
	mockBlueskyLinkCardTitle
} from '$lib/ui/components/posts/providers/bluesky/blueskyLinkCardPreview';

describe('blueskyLinkCardPreview', () => {
	it('derives a title from the last URL path segment', () => {
		expect(
			mockBlueskyLinkCardTitle(
				'https://www.openquok.com/blog/best-buffer-alternatives-for-teams'
			)
		).toBe('Best Buffer Alternatives For Teams');
	});

	it('derives a description from the hostname', () => {
		expect(
			mockBlueskyLinkCardDescription('https://www.openquok.com/pricing', 'www.openquok.com')
		).toBe('Summary from openquok.com');
	});
});
