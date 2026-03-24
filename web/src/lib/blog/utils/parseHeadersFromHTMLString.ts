import { stringToSlug } from '$lib/ui/helpers/common';

export type ParsedHtmlHeader = {
	level: number;
	title: string;
	slug: string;
};

function assignUniqueSlugs(headers: ParsedHtmlHeader[]): ParsedHtmlHeader[] {
	const used = new Set<string>();
	return headers.map((h) => {
		const base = h.slug;
		let slug = base;
		let n = 2;
		while (used.has(slug)) {
			slug = `${base}-${n}`;
			n += 1;
		}
		used.add(slug);
		return { ...h, slug };
	});
}

/**
 * Parses h1–h6 headings from HTML (SSR-safe: regex fallback when DOMParser is unavailable).
 * Slugs are unique so anchors and the table of contents stay aligned when titles repeat.
 */
export function parseHeadersFromHTMLString(htmlContent: string): ParsedHtmlHeader[] {
	const headers: ParsedHtmlHeader[] = [];

	if (typeof DOMParser === 'undefined') {
		const headerRegex = /<h([1-6]).*?>(.*?)<\/h\1>/g;
		let match: RegExpExecArray | null;
		while ((match = headerRegex.exec(htmlContent)) !== null) {
			const level = parseInt(match[1], 10);
			const title = match[2].replace(/<[^>]*>/g, '').trim();
			const slug = stringToSlug(title);
			headers.push({ level, title, slug });
		}
		return assignUniqueSlugs(headers);
	}

	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlContent, 'text/html');
	const selectedHeaders = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

	selectedHeaders.forEach((header) => {
		const level = parseInt(header.tagName.slice(1), 10);
		const title = header.textContent?.trim() ?? '';
		const slug = stringToSlug(title);
		headers.push({ level, title, slug });
	});

	return assignUniqueSlugs(headers);
}
