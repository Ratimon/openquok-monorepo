import { describe, expect, it } from 'vitest';

import { normalizeForCompare } from './fieldCompare.js';
import { richHtmlToPlainText, sanitizeRichHtmlBeforeCompare } from './richHtmlNormalize.js';

const PROFILE_HTML = `<p>Paragraph one.</p> <p>Paragraph two.</p> <p>Paragraph three.</p> $html$;`;

const UNEED_EDITOR_HTML = `<p>Paragraph one.</p><p><br><br class="ProseMirror-trailingBreak"></p><p>Paragraph two.</p><p><br><br class="ProseMirror-trailingBreak"></p><p>Paragraph three.</p><p><br>$html$;</p>`;

describe('sanitizeRichHtmlBeforeCompare', () => {
	it('strips ProseMirror trailing-break paragraphs and $html$ noise', () => {
		const cleaned = sanitizeRichHtmlBeforeCompare(UNEED_EDITOR_HTML);
		expect(cleaned).not.toContain('ProseMirror-trailingBreak');
		expect(cleaned).not.toContain('$html$');
		expect(cleaned).toContain('<p>Paragraph one.</p>');
		expect(cleaned).toContain('<p>Paragraph two.</p>');
	});
});

describe('richHtmlToPlainText', () => {
	it('compares equal through normalizeForCompare', () => {
		const a = { kind: 'rich_html' as const, scalar: PROFILE_HTML, present: true };
		const b = { kind: 'rich_html' as const, scalar: UNEED_EDITOR_HTML, present: true };
		expect(normalizeForCompare(a, b, 'rich_html')).toBe(true);
	});
});
