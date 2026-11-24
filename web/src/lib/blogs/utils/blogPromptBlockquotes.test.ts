import { describe, expect, it } from 'vitest';

import { prepareBlogContentForDisplay } from '$lib/blogs/utils/blogContent';
import {
	blogPostPromptAnchorId,
	parseBlogPromptBlockquotesFromHtml,
	stampBlogPromptBlockquoteIds
} from '$lib/blogs/utils/blogPromptBlockquotes';

describe('parseBlogPromptBlockquotesFromHtml', () => {
	it('extracts plain text and section title from preceding h2', () => {
		const html = `<h2>Verify in a new chat</h2>
<p>Ask:</p>
<blockquote><p>List my connected social media accounts.</p></blockquote>`;

		const blocks = parseBlogPromptBlockquotesFromHtml(html);
		expect(blocks).toHaveLength(1);
		expect(blocks[0].name).toBe('Verify in a new chat');
		expect(blocks[0].text).toBe('List my connected social media accounts.');
	});

	it('skips empty blockquotes', () => {
		expect(parseBlogPromptBlockquotesFromHtml('<blockquote><p></p></blockquote>')).toEqual([]);
	});
});

describe('stampBlogPromptBlockquoteIds', () => {
	it('adds blog-prompt-N ids in document order', () => {
		const html =
			'<blockquote><p>One</p></blockquote><blockquote><p>Two</p></blockquote>';
		const stamped = stampBlogPromptBlockquoteIds(html);
		expect(stamped).toContain(`id="${blogPostPromptAnchorId(0)}"`);
		expect(stamped).toContain(`id="${blogPostPromptAnchorId(1)}"`);
	});
});

describe('prepareBlogContentForDisplay blockquotes', () => {
	it('stamps prompt ids on blockquotes', () => {
		const html = prepareBlogContentForDisplay(
			'<blockquote><p>List my connected social media accounts.</p></blockquote>'
		);
		expect(html).toContain(`id="${blogPostPromptAnchorId(0)}"`);
	});
});