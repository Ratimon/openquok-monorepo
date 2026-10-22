/** Remove inline `<img>` tags from rich HTML (directory descriptions without embedded images). */
export function stripInlineImagesFromRichHtml(html: string): string {
	const trimmed = html.trim();
	if (!trimmed) return html;

	if (typeof document !== 'undefined') {
		const doc = document.createElement('div');
		doc.innerHTML = trimmed;
		for (const img of Array.from(doc.querySelectorAll('img'))) {
			img.remove();
		}
		return doc.innerHTML;
	}

	return trimmed.replace(/<img\b[^>]*>/gi, '');
}
