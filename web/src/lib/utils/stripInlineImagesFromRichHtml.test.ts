import { describe, expect, it } from 'vitest';

import { stripInlineImagesFromRichHtml } from './stripInlineImagesFromRichHtml';

describe('stripInlineImagesFromRichHtml', () => {
	it('removes img tags from HTML', () => {
		expect(
			stripInlineImagesFromRichHtml('<p>Hi</p><img src="x" alt="y" /><p>Bye</p>')
		).toBe('<p>Hi</p><p>Bye</p>');
	});
});
