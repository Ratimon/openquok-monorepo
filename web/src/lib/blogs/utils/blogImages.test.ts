import { parseFragment, serialize } from 'parse5';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	buildBlogInlineImageSrc,
	extractBlogImageStoragePathFromImageSrc,
	extractBlogInlineImagesFromHtml,
	normalizeBlogInlineImagesInHtml
} from '$lib/blogs/utils/blogImages';

type Parse5Element = {
	nodeName: string;
	tagName?: string;
	attrs?: Array<{ name: string; value: string }>;
	childNodes?: Parse5Node[];
};

type Parse5Node = Parse5Element | { nodeName: string; value?: string; childNodes?: Parse5Node[] };

function findElements(root: Parse5Node, tagName: string): Parse5Element[] {
	const matches: Parse5Element[] = [];
	const walk = (node: Parse5Node) => {
		if ('tagName' in node && node.tagName === tagName) {
			matches.push(node);
		}
		for (const child of node.childNodes ?? []) {
			walk(child);
		}
	};
	walk(root);
	return matches;
}

function createParse5DocumentStub() {
	return {
		createElement(tagName: string) {
			if (tagName !== 'div') {
				throw new Error(`Unsupported tag: ${tagName}`);
			}

			let root: Parse5Node = { nodeName: '#document-fragment', childNodes: [] };

			return {
				set innerHTML(html: string) {
					root = parseFragment(html);
				},
				get innerHTML() {
					return serialize(root);
				},
				querySelectorAll(selector: string) {
					if (selector !== 'img') return [];

					return findElements(root, 'img').map((node) => ({
						getAttribute(name: string) {
							const attr = node.attrs?.find((entry) => entry.name === name);
							return attr?.value ?? null;
						},
						setAttribute(name: string, value: string) {
							node.attrs ??= [];
							const existing = node.attrs.find((entry) => entry.name === name);
							if (existing) {
								existing.value = value;
								return;
							}
							node.attrs.push({ name, value });
						}
					}));
				}
			};
		}
	};
}

describe('extractBlogImageStoragePathFromImageSrc', () => {
	it('derives storage keys from Supabase public object URLs', () => {
		expect(
			extractBlogImageStoragePathFromImageSrc(
				'https://example.supabase.co/storage/v1/object/public/blog_images/user-1/photo.webp'
			)
		).toBe('user-1/photo.webp');
	});

	it('derives storage keys from API download URLs', () => {
		expect(
			extractBlogImageStoragePathFromImageSrc(
				'/api/v1/image/download?databaseName=blog_images&imageUrl=user-1%2Fphoto.webp'
			)
		).toBe('user-1/photo.webp');
	});

	it('ignores blob preview URLs', () => {
		expect(extractBlogImageStoragePathFromImageSrc('blob:http://localhost/abc')).toBeNull();
	});
});

describe('buildBlogInlineImageSrc', () => {
	it('builds an API download URL when Supabase public URL is unavailable', () => {
		expect(buildBlogInlineImageSrc('user-1/photo.webp')).toBe(
			'/api/v1/image/download?databaseName=blog_images&imageUrl=user-1%2Fphoto.webp'
		);
	});
});

describe('extractBlogInlineImagesFromHtml', () => {
	it('extracts storage path and alt regardless of attribute order', () => {
		const storagePath = 'user-1/setup.png';
		const html = `<p><img alt="Token setup screenshot" data-storage-path="${storagePath}" src="blob:http://localhost/preview"></p>`;

		expect(extractBlogInlineImagesFromHtml(html)).toEqual([
			{ storagePath, alt: 'Token setup screenshot', index: 0 }
		]);
	});

	it('returns multiple images in document order with stable indexes', () => {
		const first = 'user-1/a.webp';
		const second = 'user-1/b.webp';
		const html = [
			`<img data-storage-path="${first}" alt="First" />`,
			`<img alt="Second" data-storage-path="${second}" />`
		].join('');

		expect(extractBlogInlineImagesFromHtml(html)).toEqual([
			{ storagePath: first, alt: 'First', index: 0 },
			{ storagePath: second, alt: 'Second', index: 1 }
		]);
	});

	it('derives storage path from src when data-storage-path is missing', () => {
		const storagePath = 'user-1/inline.png';
		const src = buildBlogInlineImageSrc(storagePath);
		const html = `<img src="${src}" alt="Workflow diagram" />`;

		expect(extractBlogInlineImagesFromHtml(html)).toEqual([
			{ storagePath, alt: 'Workflow diagram', index: 0 }
		]);
	});

	it('skips non-blog images such as blob previews and external URLs', () => {
		const storagePath = 'user-1/kept.webp';
		const html = [
			'<img src="blob:http://localhost/preview" alt="Ignored blob" />',
			'<img src="https://cdn.example.com/photo.jpg" alt="Ignored external" />',
			`<img data-storage-path="${storagePath}" alt="Kept" />`
		].join('');

		expect(extractBlogInlineImagesFromHtml(html)).toEqual([
			{ storagePath, alt: 'Kept', index: 0 }
		]);
	});

	it('clears alt text that looks like a filename', () => {
		const storagePath = 'user-1/photo.webp';
		const html = `<img data-storage-path="${storagePath}" alt="photo.webp" />`;

		expect(extractBlogInlineImagesFromHtml(html)).toEqual([
			{ storagePath, alt: '', index: 0 }
		]);
	});

	it('returns an empty list for empty HTML', () => {
		expect(extractBlogInlineImagesFromHtml('')).toEqual([]);
		expect(extractBlogInlineImagesFromHtml('   ')).toEqual([]);
	});
});

describe('normalizeBlogInlineImagesInHtml', () => {
	beforeEach(() => {
		vi.stubGlobal('document', createParse5DocumentStub());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	function decodeHtmlEntities(html: string): string {
		return html.replaceAll('&amp;', '&');
	}

	it('preserves meaningful alt while fixing src and data-storage-path', () => {
		const storagePath = 'user-1/hero.webp';
		const html = `<p><img src="blob:http://localhost/preview" data-storage-path="${storagePath}" alt="Sunset over the ocean"></p>`;

		const normalized = decodeHtmlEntities(normalizeBlogInlineImagesInHtml(html));

		expect(normalized).toContain('alt="Sunset over the ocean"');
		expect(normalized).toContain(`data-storage-path="${storagePath}"`);
		expect(normalized).toContain(`src="${buildBlogInlineImageSrc(storagePath)}"`);
	});

	it('clears alt text that looks like a filename', () => {
		const storagePath = 'user-1/photo.webp';
		const html = `<p><img src="blob:http://localhost/preview" data-storage-path="${storagePath}" alt="photo.webp"></p>`;

		const normalized = decodeHtmlEntities(normalizeBlogInlineImagesInHtml(html));

		expect(normalized).toContain('alt=""');
		expect(normalized).not.toContain('alt="photo.webp"');
		expect(normalized).toContain(`data-storage-path="${storagePath}"`);
		expect(normalized).toContain(`src="${buildBlogInlineImageSrc(storagePath)}"`);
	});

	it('derives storage path from src when data-storage-path is missing', () => {
		const storagePath = 'user-1/inline.png';
		const src = buildBlogInlineImageSrc(storagePath);
		const html = `<p><img src="${src}" alt="Diagram of the workflow"></p>`;

		const normalized = decodeHtmlEntities(normalizeBlogInlineImagesInHtml(html));

		expect(normalized).toContain('alt="Diagram of the workflow"');
		expect(normalized).toContain(`data-storage-path="${storagePath}"`);
		expect(normalized).toContain(`src="${src}"`);
	});
});
