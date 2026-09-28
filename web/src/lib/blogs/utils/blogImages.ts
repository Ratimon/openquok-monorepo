import { parseFragment, serialize } from 'parse5';

import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

import { BLOG_IMAGES_BUCKET } from '$lib/blogs/constants/config';

type Parse5Element = {
	nodeName: string;
	tagName?: string;
	attrs?: Array<{ name: string; value: string }>;
	childNodes?: Parse5Node[];
};

type Parse5Node = Parse5Element | { nodeName: string; value?: string; childNodes?: Parse5Node[] };

function isParse5Element(node: Parse5Node): node is Parse5Element {
	return 'tagName' in node && typeof node.tagName === 'string';
}

function classNames(attrs: Parse5Element['attrs']): string[] {
	const raw = attrs?.find((a) => a.name === 'class')?.value ?? '';
	return raw.split(/\s+/).filter(Boolean);
}

function getParse5Attr(node: Parse5Element, name: string): string {
	return node.attrs?.find((a) => a.name === name)?.value ?? '';
}

function setParse5Attr(node: Parse5Element, name: string, value: string): void {
	node.attrs ??= [];
	const existing = node.attrs.find((a) => a.name === name);
	if (existing) {
		existing.value = value;
		return;
	}
	node.attrs.push({ name, value });
}

function walkParse5Nodes(root: Parse5Node, visit: (node: Parse5Element) => void): void {
	const stack: Parse5Node[] = [root];
	while (stack.length > 0) {
		const node = stack.pop();
		if (!node) continue;
		if (isParse5Element(node)) visit(node);
		for (const child of node.childNodes ?? []) {
			stack.push(child);
		}
	}
}

function findParse5Parent(root: Parse5Node, target: Parse5Node): Parse5Node | null {
	const children = root.childNodes ?? [];
	for (const child of children) {
		if (child === target) return root;
		const nested = findParse5Parent(child, target);
		if (nested) return nested;
	}
	return null;
}

function removeParse5Node(root: Parse5Node, target: Parse5Node): void {
	const parent = findParse5Parent(root, target);
	if (!parent?.childNodes) return;
	const index = parent.childNodes.indexOf(target);
	if (index !== -1) parent.childNodes.splice(index, 1);
}

function replaceParse5Node(root: Parse5Node, target: Parse5Node, replacement: Parse5Node): void {
	const parent = findParse5Parent(root, target);
	if (!parent?.childNodes) return;
	const index = parent.childNodes.indexOf(target);
	if (index !== -1) parent.childNodes.splice(index, 1, replacement);
}

function findParse5ImgDescendant(node: Parse5Element): Parse5Element | null {
	let found: Parse5Element | null = null;
	walkParse5Nodes(node, (el) => {
		if (el.tagName === 'img' && !found) found = el;
	});
	return found;
}

function mutateBlogHtmlWithParse5(html: string, mutate: (root: Parse5Node) => void): string {
	const root = parseFragment(html);
	mutate(root);
	return serialize(root);
}

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
 * Normalizes hero fields and storage paths to a bare `blog_images` object key
 * (e.g. `authUid-random.jpg`), accepting legacy full public URLs or `blog_images/` prefixes.
 */
export function resolveBlogImageStorageKey(raw: string): string | null {
	const trimmed = raw.trim();
	if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;

	const fromUrl = extractBlogImageStoragePathFromImageSrc(trimmed);
	if (fromUrl) return fromUrl.replace(/^\/+/, '');

	let key = trimmed.replace(/^\/+/, '');
	if (key.startsWith(`${BLOG_IMAGES_BUCKET}/`)) {
		key = key.slice(BLOG_IMAGES_BUCKET.length + 1);
	}
	if (key.includes('://')) return null;
	if (!key) return null;
	return key;
}

/**
 * Builds a browser-usable `src` for an object in `blog_images` after upload.
 * Uses `VITE_PUBLIC_SUPABASE_URL` when set; otherwise falls back to the API download URL.
 */
export function buildBlogInlineImageSrc(storagePath: string): string {
	const key = resolveBlogImageStorageKey(storagePath);
	if (!key) return '';

	const trimmed = key;
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
	if (!html.trim()) return html;

	return mutateBlogHtmlWithParse5(html, (root) => {
		const wraps: Parse5Element[] = [];
		walkParse5Nodes(root, (el) => {
			if (el.tagName === 'div' && classNames(el.attrs).includes('content-editor-image-wrap')) {
				wraps.push(el);
			}
		});

		for (const wrap of wraps) {
			const img = findParse5ImgDescendant(wrap);
			if (img) {
				replaceParse5Node(root, wrap, img);
			} else {
				removeParse5Node(root, wrap);
			}
		}

		const removeClasses = new Set([
			'content-editor-image-missing-alt',
			'content-editor-image-delete',
			'content-editor-image-alt-field',
			'content-editor-image-alt-label',
			'content-editor-image-alt-input',
			'content-editor-image-media'
		]);
		const toRemove: Parse5Element[] = [];
		walkParse5Nodes(root, (el) => {
			const classes = classNames(el.attrs);
			if (classes.some((c) => removeClasses.has(c))) toRemove.push(el);
		});
		for (const el of toRemove) {
			removeParse5Node(root, el);
		}
	});
}

/**
 * Ensures each blog inline `<img>` has `data-storage-path` and a working `src` for the current env.
 * No-ops when `document` is unavailable (SSR).
 */
export function normalizeBlogInlineImagesInHtml(html: string): string {
	if (!html.trim()) return html;

	const stripped = stripContentEditorMarkupFromBlogHtml(html);

	return mutateBlogHtmlWithParse5(stripped, (root) => {
		walkParse5Nodes(root, (el) => {
			if (el.tagName !== 'img') return;

			const rawAttr = getParse5Attr(el, 'data-storage-path').trim();
			const fromAttr =
				rawAttr && rawAttr !== 'null' && rawAttr !== 'undefined' ? rawAttr : '';
			const src = getParse5Attr(el, 'src').trim();
			const path =
				resolveBlogImageStorageKey(fromAttr) ||
				extractBlogImageStoragePathFromImageSrc(src);
			if (!path) return;

			setParse5Attr(el, 'data-storage-path', path);
			setParse5Attr(el, 'src', buildBlogInlineImageSrc(path));

			const alt = normalizeBlogInlineImageAlt(getParse5Attr(el, 'alt'));
			setParse5Attr(el, 'alt', alt);
		});
	});
}
