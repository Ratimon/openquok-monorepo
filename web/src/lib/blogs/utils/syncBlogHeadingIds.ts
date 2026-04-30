import { parseHeadersFromHTMLString } from '$lib/blogs/utils/parseHeadersFromHTMLString';

/**
 * Assigns `id` on each heading in `container` so `#slug` links (e.g. from the table of contents)
 * match `parseHeadersFromHTMLString(htmlContent)` for the same source HTML.
 */
export function syncBlogHeadingIds(container: HTMLElement, htmlContent: string): void {
	const headers = parseHeadersFromHTMLString(htmlContent);
	const els = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
	els.forEach((el, i) => {
		const h = headers[i];
		if (h) el.id = h.slug;
	});
}
