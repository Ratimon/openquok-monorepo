import { buildBlogInlineImageSrc } from '$lib/blog/utils/buildBlogInlineImageSrc';

import { extractBlogImageStoragePathFromImageSrc } from '$lib/blog/utils/extractBlogImageStoragePathFromImageSrc';

/**
 * Ensures each blog inline `<img>` has `data-storage-path` and a working `src` for the current env.
 * No-ops when `document` is unavailable (SSR).
 */
export function normalizeBlogInlineImagesInHtml(html: string): string {
	if (typeof document === 'undefined' || !html.trim()) return html;

	const doc = document.createElement('div');
	doc.innerHTML = html;

	for (const img of Array.from(doc.querySelectorAll('img'))) {
		const rawAttr = (img.getAttribute('data-storage-path') ?? '').trim();
		const fromAttr =
			rawAttr && rawAttr !== 'null' && rawAttr !== 'undefined' ? rawAttr : '';
		const src = (img.getAttribute('src') ?? '').trim();
		const path = fromAttr || extractBlogImageStoragePathFromImageSrc(src);
		if (!path) continue;

		img.setAttribute('data-storage-path', path);
		img.setAttribute('src', buildBlogInlineImageSrc(path));

		const alt = (img.getAttribute('alt') ?? '').trim();
		if (alt && /\.(webp|png|jpe?g|gif|svg)$/i.test(alt)) {
			img.setAttribute('alt', '');
		}
	}

	return doc.innerHTML;
}

