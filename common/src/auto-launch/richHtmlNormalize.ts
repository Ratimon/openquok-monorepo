/** Remove editor-only markup before compare and rail display (e.g. ProseMirror trailing breaks). */
export function sanitizeRichHtmlBeforeCompare(html: string): string {
	let out = html.trim();
	// Stray SQL/template markers sometimes appear on stored descriptions.
	out = out.replace(/\$html\$;?/gi, '');
	out = out.replace(/<br[^>]*\bclass="[^"]*ProseMirror-trailingBreak[^"]*"[^>]*>/gi, '');
	for (let pass = 0; pass < 6; pass += 1) {
		const next = out.replace(/<p[^>]*>\s*(?:<br\s*\/?>\s*)*<\/p>/gi, '');
		if (next === out) break;
		out = next;
	}
	return out.trim();
}

export function stripHtmlToPlainText(html: string): string {
	return html
		.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(?:p|div|li|h[1-6])>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/[ \t]{2,}/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/** Plain text for compare and step-rail preview of rich HTML fields. */
export function richHtmlToPlainText(html: string): string {
	return stripHtmlToPlainText(sanitizeRichHtmlBeforeCompare(html));
}

function escapePlainTextForHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/** Turn edited plain text into simple HTML paragraphs for rich editors. */
export function plainTextToSimpleHtml(text: string): string {
	const blocks = text
		.split(/\n\n+/)
		.map((block) => block.trim())
		.filter(Boolean);
	if (blocks.length === 0) return '';
	return blocks
		.map((block) => {
			const inner = escapePlainTextForHtml(block).replace(/\n/g, '<br>');
			return `<p>${inner}</p>`;
		})
		.join('');
}
