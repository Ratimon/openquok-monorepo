import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

import { BLOG_IMAGES_BUCKET } from '$lib/blogs/constants/config';

function trimApiBase(): string {
	return normalizeApiBaseUrl(String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? ''));
}

/** Encode each path segment for use in a URL path (Supabase public object URL). */
function encodeStoragePathSegments(storagePath: string): string {
	return storagePath
		.split('/')
		.map((s) => encodeURIComponent(s))
		.join('/');
}

/**
 * Builds a browser-usable `src` for an object in `blog_images` after upload.
 * Uses `VITE_PUBLIC_SUPABASE_URL` when set; otherwise falls back to the API download URL.
 */
export function buildBlogInlineImageSrc(storagePath: string): string {
	const trimmed = storagePath.replace(/^\/+/, '');
	const supabasePublic =
		typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_SUPABASE_URL
			? String(import.meta.env.VITE_PUBLIC_SUPABASE_URL).replace(/\/$/, '')
			: '';

	if (supabasePublic) {
		return `${supabasePublic}/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/${encodeStoragePathSegments(trimmed)}`;
	}

	const apiBase = trimApiBase();
	return `${apiBase}/api/v1/image/download?databaseName=${BLOG_IMAGES_BUCKET}&imageUrl=${encodeURIComponent(trimmed)}`;
}

const PUBLIC_OBJECT_MARKER = `/object/public/${BLOG_IMAGES_BUCKET}/`;

/**
 * Derives the storage object key for `blog_images` from an `<img src>` value (full URL, relative, or download query).
 */
export function extractBlogImageStoragePathFromImageSrc(src: string): string | null {
	const trimmed = src.trim();
	if (!trimmed || trimmed.startsWith('blob:')) return null;

	let i = trimmed.indexOf(PUBLIC_OBJECT_MARKER);
	if (i !== -1) {
		const rest = trimmed.slice(i + PUBLIC_OBJECT_MARKER.length).split(/[?#]/)[0];
		return rest ? decodeURIComponent(rest) : null;
	}

	try {
		const base = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
		const u = new URL(trimmed, base);
		if (u.searchParams.get('databaseName') === BLOG_IMAGES_BUCKET) {
			const imageUrl = u.searchParams.get('imageUrl');
			if (imageUrl) return decodeURIComponent(imageUrl);
		}
		const path = u.pathname;
		i = path.indexOf(PUBLIC_OBJECT_MARKER);
		if (i !== -1) {
			const rest = path.slice(i + PUBLIC_OBJECT_MARKER.length).split(/[?#]/)[0];
			return rest ? decodeURIComponent(rest) : null;
		}
	} catch {
		/* ignore */
	}

	if (trimmed.includes('databaseName=blog_images')) {
		try {
			const q = trimmed.includes('?') ? trimmed.split('?')[1] ?? '' : '';
			const params = new URLSearchParams(q);
			if (params.get('databaseName') === BLOG_IMAGES_BUCKET) {
				const imageUrl = params.get('imageUrl');
				if (imageUrl) return decodeURIComponent(imageUrl);
			}
		} catch {
			/* ignore */
		}
	}

	// Bare object key (no slashes) — e.g. `uuid-random.webp` from our uploader
	if (!trimmed.includes('/') && !trimmed.includes('\\')) {
		const key = trimmed.split(/[?#]/)[0]?.trim();
		if (key && /\.(webp|png|jpe?g|gif|svg)$/i.test(key)) return decodeURIComponent(key);
	}

	return null;
}

/**
 * Collects `blog_images` object keys referenced by HTML body (src URLs and `data-storage-path`).
 */
export function extractBlogImageStoragePathsFromHtml(html: string): Set<string> {
	const keys = new Set<string>();
	if (!html) return keys;

	const srcRE = /\ssrc\s*=\s*["']([^"']+)["']/gi;
	const storagePathRE = /\sdata-storage-path\s*=\s*["']([^"']+)["']/gi;
	let m: RegExpExecArray | null;
	while ((m = srcRE.exec(html)) !== null) {
		const p = extractBlogImageStoragePathFromImageSrc(m[1]);
		if (p) keys.add(p);
	}
	while ((m = storagePathRE.exec(html)) !== null) {
		const raw = m[1]?.trim().replace(/^\/+/, '') ?? '';
		if (raw && raw !== 'null' && raw !== 'undefined') keys.add(decodeURIComponent(raw));
	}

	return keys;
}

/** Clears `alt` when it looks like a bare image filename (e.g. `photo.webp`). */
function normalizeBlogInlineImageAlt(alt: string): string {
	const trimmed = alt.trim();
	if (trimmed && /\.(webp|png|jpe?g|gif|svg)$/i.test(trimmed)) {
		return '';
	}
	return trimmed;
}

function readHtmlAttribute(tag: string, attributeName: string): string | null {
	const re = new RegExp(`\\s${attributeName}\\s*=\\s*["']([^"']*)["']`, 'i');
	const match = tag.match(re);
	return match ? match[1] : null;
}

export type BlogInlineImageFromHtml = {
	storagePath: string;
	alt: string;
	index: number;
};

/**
 * Ordered inline `blog_images` references in HTML body (SSR-safe regex; no `document`).
 * Skips external URLs, blob previews, and other non-`blog_images` `<img>` tags.
 */
export function extractBlogInlineImagesFromHtml(html: string): BlogInlineImageFromHtml[] {
	const images: BlogInlineImageFromHtml[] = [];
	if (!html.trim()) return images;

	const imgTagRE = /<img\b[^>]*>/gi;
	let match: RegExpExecArray | null;
	let index = 0;

	while ((match = imgTagRE.exec(html)) !== null) {
		const tag = match[0];
		const rawAttr = (readHtmlAttribute(tag, 'data-storage-path') ?? '').trim();
		const fromAttr =
			rawAttr && rawAttr !== 'null' && rawAttr !== 'undefined'
				? decodeURIComponent(rawAttr.replace(/^\/+/, ''))
				: '';
		const src = (readHtmlAttribute(tag, 'src') ?? '').trim();
		const storagePath = fromAttr || (src ? extractBlogImageStoragePathFromImageSrc(src) : null);
		if (!storagePath) continue;

		const alt = normalizeBlogInlineImageAlt(readHtmlAttribute(tag, 'alt') ?? '');
		images.push({ storagePath, alt, index });
		index += 1;
	}

	return images;
}

/**
 * Removes TipTap blog-editor chrome (wrapper, delete button, alt input, legacy badge) from HTML.
 * Keeps the inner `<img>` when a wrapper is found. SSR-safe no-op without `document`.
 */
export function stripContentEditorMarkupFromBlogHtml(html: string): string {
	if (typeof document === 'undefined' || !html.trim()) return html;

	const doc = document.createElement('div');
	doc.innerHTML = html;

	for (const wrap of Array.from(doc.querySelectorAll('.content-editor-image-wrap'))) {
		const img = wrap.querySelector('img');
		if (img) {
			wrap.replaceWith(img.cloneNode(true));
		} else {
			wrap.remove();
		}
	}

	for (const el of Array.from(
		doc.querySelectorAll(
			'.content-editor-image-missing-alt, .content-editor-image-delete, .content-editor-image-alt-field, .content-editor-image-alt-label, .content-editor-image-alt-input, .content-editor-image-media'
		)
	)) {
		el.remove();
	}

	return doc.innerHTML;
}

/**
 * Ensures each blog inline `<img>` has `data-storage-path` and a working `src` for the current env.
 * No-ops when `document` is unavailable (SSR).
 */
export function normalizeBlogInlineImagesInHtml(html: string): string {
	if (typeof document === 'undefined' || !html.trim()) return html;

	const doc = document.createElement('div');
	doc.innerHTML = stripContentEditorMarkupFromBlogHtml(html);

	for (const img of Array.from(doc.querySelectorAll('img'))) {
		const rawAttr = (img.getAttribute('data-storage-path') ?? '').trim();
		const fromAttr =
			rawAttr && rawAttr !== 'null' && rawAttr !== 'undefined' ? rawAttr : '';
		const src = (img.getAttribute('src') ?? '').trim();
		const path = fromAttr || extractBlogImageStoragePathFromImageSrc(src);
		if (!path) continue;

		img.setAttribute('data-storage-path', path);
		img.setAttribute('src', buildBlogInlineImageSrc(path));

		const alt = normalizeBlogInlineImageAlt(img.getAttribute('alt') ?? '');
		img.setAttribute('alt', alt);
	}

	return doc.innerHTML;
}
