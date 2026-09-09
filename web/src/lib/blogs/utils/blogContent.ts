import { buildExternalLinkRel, resolveExternalLinkPolicy } from '$lib/utils/externalLinkRel';
import { stringToSlug } from '$lib/ui/helpers/common';

/**
 * Align blog-body `<a>` tags with ExternalLink / outbound-link policy.
 *
 * Internal (relative, hash, mailto/tel, own openquok.com host): strip forced TipTap rel/target.
 * Allowlisted external (npmjs.com, first-party GitHub): `target="_blank"` only.
 * Other absolute http(s): `rel="noopener noreferrer nofollow"` + `target="_blank"`.
 */

const OWN_HOST_SUFFIX = 'openquok.com';

function readHref(attrBlob: string): string {
	const match = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrBlob);
	return (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').trim();
}

function stripRelAndTarget(attrBlob: string): string {
	return attrBlob
		.replace(/\s*\brel\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.replace(/\s*\btarget\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.trim();
}

function hostnameFromHref(href: string): string | null {
	try {
		if (href.startsWith('//')) {
			return new URL(`https:${href}`).hostname.toLowerCase();
		}
		return new URL(href).hostname.toLowerCase();
	} catch {
		return null;
	}
}

function isOwnSiteHostname(hostname: string): boolean {
	const h = hostname.toLowerCase();
	if (h === 'localhost' || h.endsWith('.localhost')) return true;
	return h === OWN_HOST_SUFFIX || h.endsWith(`.${OWN_HOST_SUFFIX}`);
}

/** True when the link should use ExternalLink-style defaults (untrusted + nofollow). */
export function isExternalBlogHref(href: string): boolean {
	const h = href.trim();
	if (!h) return false;
	if (h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:')) return false;
	if (h.startsWith('/') && !h.startsWith('//')) return false;
	if (!/^https?:\/\//i.test(h) && !h.startsWith('//')) {
		// Relative / other non-http schemes — not ExternalLink territory.
		return false;
	}
	const hostname = hostnameFromHref(h);
	if (!hostname) return true;
	if (isOwnSiteHostname(hostname)) return false;
	if (typeof window !== 'undefined' && window.location?.hostname) {
		if (hostname === window.location.hostname.toLowerCase()) return false;
	}
	return true;
}

export function normalizeBlogContentLinks(html: string): string {
	if (!html.trim()) return html;

	return html.replace(/<a\b([^>]*)>/gi, (full, attrBlob: string) => {
		const href = readHref(attrBlob);
		if (!href) return full;

		const attrs = stripRelAndTarget(attrBlob);
		if (isExternalBlogHref(href)) {
			const rel = buildExternalLinkRel(resolveExternalLinkPolicy(href));
			const extra = rel ? `rel="${rel}" target="_blank"` : 'target="_blank"';
			return attrs.length > 0 ? `<a ${attrs} ${extra}>` : `<a ${extra}>`;
		}
		return attrs.length > 0 ? `<a ${attrs}>` : '<a>';
	});
}

function decodeHtmlEntities(html: string): string {
	return html
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x27;/gi, "'")
		.replace(/&#0*60;/g, '<')
		.replace(/&#x0*3c;/gi, '<')
		.replace(/&#0*62;/g, '>')
		.replace(/&#x0*3e;/gi, '>');
}

function looksLikeHtml(text: string): boolean {
	return /<\/?[a-z][\s\S]*>/i.test(text);
}

function looksLikeEncodedHtml(text: string): boolean {
	return /(?:&lt;|&#0*60;|&#x0*3c;)\s*\/?\s*[a-z]/i.test(text);
}

/** TipTap Visual mode often wraps pasted HTML as a single code block or paragraph of escaped tags. */
function unwrapTipTapEscapedHtmlShell(html: string): string {
	const trimmed = html.trim();
	const preCode = /^<pre\b[^>]*>\s*<code\b[^>]*>([\s\S]*)<\/code>\s*<\/pre>$/i.exec(trimmed);
	if (preCode && looksLikeEncodedHtml(preCode[1])) {
		return decodeHtmlEntities(preCode[1]);
	}
	const paragraph = /^<p\b[^>]*>([\s\S]*)<\/p>$/i.exec(trimmed);
	if (paragraph && looksLikeEncodedHtml(paragraph[1])) {
		return decodeHtmlEntities(paragraph[1]);
	}
	return html;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Convert plain text (paragraphs separated by blank lines) into simple HTML. */
export function plainTextToBlogHtml(text: string): string {
	const blocks = text.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);
	if (blocks.length === 0) return '';

	return blocks
		.map((block) => {
			const lines = block.split(/\n/).map((line) => escapeHtml(line.trim())).filter(Boolean);
			return `<p>${lines.join('<br>')}</p>`;
		})
		.join('');
}

/**
 * Repair content saved when raw HTML was pasted into the TipTap editor as plain text
 * (each tag line wrapped in `<p>&lt;...&gt;</p>`).
 */
export function repairDoubleEncodedBlogHtml(html: string): string {
	let current = unwrapTipTapEscapedHtmlShell(html);
	for (let i = 0; i < 3; i++) {
		if (!looksLikeEncodedHtml(current) && !current.includes('&lt;')) break;
		current = decodeHtmlEntities(current);
		current = unwrapTipTapEscapedHtmlShell(current);
	}
	return current;
}

/**
 * When authors paste plain text, section titles often become short `<p>` blocks.
 * Promote those to `<h2>` so typography styles apply. Skips content that already has headings.
 */
function promoteLikelySectionHeadings(html: string): string {
	if (/<h[1-6]\b/i.test(html)) return html;

	let isFirstParagraph = true;
	return html.replace(/<p>([^<]{1,100})<\/p>(\s*)<p>/gi, (match, title: string, gap: string) => {
		const text = title.trim();
		if (!text || text.length > 100) return match;

		if (isFirstParagraph) {
			isFirstParagraph = false;
			// Keep the opening subtitle/intro as a normal paragraph.
			if (text.length > 55 || /[.!?]$/.test(text)) return match;
		}

		return `<h2>${title}</h2>${gap}<p>`;
	});
}

/**
 * Promote short standalone CTA/callout lines into blockquotes for display.
 * This mainly repairs content that was drafted as plain text without explicitly
 * applying blockquote formatting in the editor.
 */
function promoteLikelyBlockquotes(html: string): string {
	if (/<blockquote\b/i.test(html)) return html;

	return html.replace(/<p>([^<]{1,180})<\/p>/gi, (match, text: string) => {
		const trimmed = text.trim();
		if (!trimmed) return match;
		const looksLikeCallout =
			/^(let|save)\b/i.test(trimmed) &&
			/[.!?]$/.test(trimmed) &&
			trimmed.length >= 24 &&
			trimmed.length <= 180;
		if (!looksLikeCallout) return match;
		return `<blockquote><p>${text}</p></blockquote>`;
	});
}

/**
 * Normalize blog post body for public rendering (SSR-safe).
 * - Decodes double-escaped HTML from bad paste/submit flows.
 * - Wraps plain text in paragraphs when no HTML tags are present.
 * - Promotes likely plain-text section titles to h2.
 * - Aligns `<a>` rel/target with ExternalLink defaults (external nofollow; internal followable).
 */
export function prepareBlogContentForDisplay(content: string): string {
	const trimmed = content.trim();
	if (!trimmed) return '';

	let html = repairDoubleEncodedBlogHtml(trimmed);
	if (!looksLikeHtml(html)) {
		html = plainTextToBlogHtml(html);
	}
	html = promoteLikelySectionHeadings(html);
	html = promoteLikelyBlockquotes(html);
	html = normalizeBlogContentLinks(html);
	return html;
}

/**
 * FAQ answers and How-to step copy: keep author HTML (including internal `<a>`),
 * wrap plain text, and normalize link `rel` — do not promote headings or callouts.
 */
export function prepareBlogRichTextForDisplay(content: string): string {
	const trimmed = content.trim();
	if (!trimmed) return '';

	let html = repairDoubleEncodedBlogHtml(trimmed);
	if (looksLikeEncodedHtml(html)) {
		html = decodeHtmlEntities(html);
	}
	if (!looksLikeHtml(html)) {
		html = plainTextToBlogHtml(html);
	}
	return normalizeBlogContentLinks(html);
}

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
