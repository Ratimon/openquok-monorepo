import { describe, expect, it } from 'vitest';

import {
	linkDirectoryRichTextToPlainText,
	prepareLinkDirectoryRichTextForDisplay
} from './linkDirectoryRichText';

describe('prepareLinkDirectoryRichTextForDisplay', () => {
	it('nofollows third-party links in opportunity copy', () => {
		const html = prepareLinkDirectoryRichTextForDisplay(
			'<p>See <a href="https://github.com/awesome-selfhosted/awesome-selfhosted-data">data repo</a>.</p>'
		);
		expect(html).toContain('rel="noopener noreferrer nofollow"');
		expect(html).toContain('target="_blank"');
	});

	it('keeps openquok.com links followable', () => {
		const html = prepareLinkDirectoryRichTextForDisplay(
			'<p><a href="https://www.openquok.com/docs">Docs</a></p>'
		);
		expect(html).not.toContain('nofollow');
	});
});

describe('linkDirectoryRichTextToPlainText', () => {
	it('strips tags for card previews', () => {
		expect(
			linkDirectoryRichTextToPlainText(
				'<p>Fork <a href="https://example.com">example</a> and open a PR.</p>'
			)
		).toBe('Fork example and open a PR.');
	});
});
