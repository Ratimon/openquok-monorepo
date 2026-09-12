export interface DocsImageFromRaw {
	/** Accessible name / caption from markdown alt text or `<img alt>`. */
	alt: string;
	/** Root-relative or absolute image URL as authored in markdown. */
	src: string;
	/** Stable order in the source document (0-based, before dedupe). */
	index: number;
}

const MARKDOWN_IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_IMG_RE = /<img\b[^>]*>/gi;

function readHtmlAttribute(tag: string, attributeName: string): string | null {
	const re = new RegExp(`\\s${attributeName}\\s*=\\s*["']([^"']*)["']`, 'i');
	const match = tag.match(re);
	return match ? match[1] : null;
}

/**
 * Extract inline images from docs markdown / MDX source for JSON-LD.
 * Supports `![alt](/path.webp)` and `<img src="…" alt="…">`.
 */
export function extractDocsImagesFromRaw(raw: string): DocsImageFromRaw[] {
	if (!raw.trim()) return [];

	const images: DocsImageFromRaw[] = [];
	let index = 0;

	for (const match of raw.matchAll(MARKDOWN_IMAGE_RE)) {
		const alt = match[1]?.trim() ?? '';
		const src = match[2]?.trim() ?? '';
		if (!src || src.startsWith('data:') || src.startsWith('blob:')) continue;
		images.push({ alt, src, index });
		index += 1;
	}

	for (const match of raw.matchAll(HTML_IMG_RE)) {
		const tag = match[0];
		const src = (readHtmlAttribute(tag, 'src') ?? '').trim();
		if (!src || src.startsWith('data:') || src.startsWith('blob:')) continue;
		const alt = (readHtmlAttribute(tag, 'alt') ?? '').trim();
		images.push({ alt, src, index });
		index += 1;
	}

	return images;
}

/** Drop duplicate `src` values while preserving first-seen order and alt text. */
export function dedupeDocsImagesFromRaw(images: DocsImageFromRaw[]): DocsImageFromRaw[] {
	const seen = new Set<string>();
	const deduped: DocsImageFromRaw[] = [];

	for (const image of images) {
		const key = image.src.trim();
		if (!key || seen.has(key)) continue;
		seen.add(key);
		deduped.push(image);
	}

	return deduped;
}
