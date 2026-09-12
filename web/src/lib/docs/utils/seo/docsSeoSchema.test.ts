import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { DOCS_FALLBACK_SOCIAL_IMAGE_ALT, DOCS_FALLBACK_SOCIAL_IMAGE_SRC } from '$lib/docs/constants/docsSeoDefaults';
import {
	dedupeDocsImagesFromRaw,
	extractDocsImagesFromRaw
} from '$lib/docs/utils/content/extractDocsImagesFromRaw';
import { buildDocsBreadcrumbListItems } from '$lib/docs/utils/seo/buildDocsBreadcrumbJsonLd';
import {
	createDocsPageSeoSchema,
	orderDocsImagesForSeo,
	pickDocsSocialPreview,
	resolveDocsImageUrl
} from '$lib/docs/utils/seo/docsSeoSchema';
import type { DocsImageFromRaw } from '$lib/docs/utils/content/extractDocsImagesFromRaw';

const quickstartFixture = readFileSync(
	join(dirname(fileURLToPath(import.meta.url)), '../../../../content/docs/getting-started/quickstart.md'),
	'utf8'
);

const QUICKSTART_URL = 'https://www.openquok.com/docs/getting-started/quickstart';
const requestUrl = new URL(QUICKSTART_URL);

const DOC_IMAGES: DocsImageFromRaw[] = [
	{
		alt: 'Workspace in Dashboard',
		src: '/docs/_assets/getting-started/1-workspace-dashboard.webp',
		index: 0
	},
	{
		alt: 'Step 5 - Kanban Board',
		src: '/docs/_assets/getting-started/5-kanban-board.webp',
		index: 5
	}
];

describe('resolveDocsImageUrl', () => {
	it('resolves root-relative docs assets against the public site origin', () => {
		expect(resolveDocsImageUrl('/docs/_assets/getting-started/5-kanban-board.webp', requestUrl, QUICKSTART_URL)).toBe(
			'https://www.openquok.com/docs/_assets/getting-started/5-kanban-board.webp'
		);
	});
});

describe('pickDocsSocialPreview', () => {
	it('prefers frontmatter ogImage over the first inline image', () => {
		const preview = pickDocsSocialPreview({
			ogImage: '/docs/_assets/getting-started/5-kanban-board.webp',
			ogImageAlt: 'Kanban preview',
			title: 'Quickstart',
			docImages: DOC_IMAGES,
			resolveImageUrl: (src) => `https://www.openquok.com${src}`
		});

		expect(preview).toEqual({
			src: '/docs/_assets/getting-started/5-kanban-board.webp',
			url: 'https://www.openquok.com/docs/_assets/getting-started/5-kanban-board.webp',
			alt: 'Kanban preview'
		});
	});

	it('falls back to the first inline image when ogImage is omitted', () => {
		const preview = pickDocsSocialPreview({
			title: 'Quickstart',
			docImages: DOC_IMAGES,
			resolveImageUrl: (src) => `https://www.openquok.com${src}`
		});

		expect(preview.src).toBe('/docs/_assets/getting-started/1-workspace-dashboard.webp');
	});

	it('falls back to the OpenQuok logo when there are no inline images or ogImage', () => {
		const preview = pickDocsSocialPreview({
			title: 'Plain doc',
			docImages: [],
			resolveImageUrl: (src) => `https://www.openquok.com${src}`
		});

		expect(preview).toEqual({
			src: DOCS_FALLBACK_SOCIAL_IMAGE_SRC,
			url: `https://www.openquok.com${DOCS_FALLBACK_SOCIAL_IMAGE_SRC}`,
			alt: DOCS_FALLBACK_SOCIAL_IMAGE_ALT
		});
	});
});

describe('orderDocsImagesForSeo', () => {
	it('moves a matching ogImage to the front without duplicating it', () => {
		const ordered = orderDocsImagesForSeo(DOC_IMAGES, {
			primarySrc: '/docs/_assets/getting-started/5-kanban-board.webp',
			primaryAlt: 'Kanban preview',
			pageTitle: 'Quickstart'
		});

		expect(ordered).toHaveLength(2);
		expect(ordered[0]?.src).toBe('/docs/_assets/getting-started/5-kanban-board.webp');
		expect(ordered[0]?.alt).toBe('Kanban preview');
	});

	it('prepends ogImage when it is not present in inline images', () => {
		const ordered = orderDocsImagesForSeo(DOC_IMAGES, {
			primarySrc: '/docs/_assets/getting-started/hero.webp',
			pageTitle: 'Quickstart'
		});

		expect(ordered[0]?.src).toBe('/docs/_assets/getting-started/hero.webp');
		expect(ordered).toHaveLength(3);
	});
});

describe('createDocsPageSeoSchema', () => {
	it('emits ImageObject nodes in the graph and links them from TechArticle', () => {
		const images = dedupeDocsImagesFromRaw(extractDocsImagesFromRaw(quickstartFixture));
		const schema = createDocsPageSeoSchema({
			title: 'Quickstart',
			description: 'Get started with OpenQuok.',
			canonicalUrl: QUICKSTART_URL,
			requestUrl,
			siteTitle: 'OpenQuok Docs',
			breadcrumbItems: buildDocsBreadcrumbListItems('/docs/getting-started/quickstart', requestUrl),
			images
		});

		const techArticle = schema['@graph'].find(
			(node) => typeof node === 'object' && node !== null && '@type' in node && node['@type'] === 'TechArticle'
		) as Record<string, unknown> | undefined;

		expect(techArticle?.image).toEqual({
			'@id': `${QUICKSTART_URL}#doc-image-1`
		});
		expect(techArticle?.associatedMedia).toBeDefined();

		const imageObjects = schema['@graph'].filter(
			(node) => typeof node === 'object' && node !== null && '@type' in node && node['@type'] === 'ImageObject'
		) as Record<string, unknown>[];

		expect(imageObjects.length).toBe(images.length);
		expect(imageObjects[0]).toMatchObject({
			'@id': `${QUICKSTART_URL}#doc-image-1`,
			caption: 'Workspace in Dashboard',
			contentUrl: 'https://www.openquok.com/docs/_assets/getting-started/1-workspace-dashboard.webp',
			encodingFormat: 'image/webp',
			representativeOfPage: true,
			isPartOf: {
				'@id': `${QUICKSTART_URL}#techarticle`
			}
		});

		const kanbanImage = imageObjects.find((node) => node.caption === 'Step 5 - Kanban Board');
		expect(kanbanImage).toMatchObject({
			contentUrl: 'https://www.openquok.com/docs/_assets/getting-started/5-kanban-board.webp'
		});
		expect(kanbanImage).not.toHaveProperty('representativeOfPage');
	});

	it('uses ogImage as the primary ImageObject when frontmatter overrides inline order', () => {
		const images = dedupeDocsImagesFromRaw(extractDocsImagesFromRaw(quickstartFixture));
		const schema = createDocsPageSeoSchema({
			title: 'Quickstart',
			description: 'Get started with OpenQuok.',
			canonicalUrl: QUICKSTART_URL,
			requestUrl,
			siteTitle: 'OpenQuok Docs',
			breadcrumbItems: buildDocsBreadcrumbListItems('/docs/getting-started/quickstart', requestUrl),
			images,
			ogImage: '/docs/_assets/getting-started/5-kanban-board.webp',
			ogImageAlt: 'Kanban preview'
		});

		expect(schema['@graph'].find(
			(node) =>
				typeof node === 'object' &&
				node !== null &&
				'@type' in node &&
				node['@type'] === 'TechArticle'
		)).toMatchObject({
			image: { '@id': `${QUICKSTART_URL}#doc-image-1` }
		});

		const primaryImage = schema['@graph'].find(
			(node) =>
				typeof node === 'object' &&
				node !== null &&
				'@id' in node &&
				node['@id'] === `${QUICKSTART_URL}#doc-image-1`
		) as Record<string, unknown> | undefined;

		expect(primaryImage).toMatchObject({
			caption: 'Kanban preview',
			contentUrl: 'https://www.openquok.com/docs/_assets/getting-started/5-kanban-board.webp',
			representativeOfPage: true
		});
	});

	it('uses the OpenQuok logo when the page has no inline images or ogImage', () => {
		const schema = createDocsPageSeoSchema({
			title: 'Plain doc',
			description: 'Text-only documentation page.',
			canonicalUrl: 'https://www.openquok.com/docs/example/plain',
			requestUrl: new URL('https://www.openquok.com/docs/example/plain'),
			siteTitle: 'OpenQuok Docs',
			breadcrumbItems: buildDocsBreadcrumbListItems('/docs/example/plain', new URL('https://www.openquok.com/docs/example/plain')),
			images: []
		});

		const techArticle = schema['@graph'].find(
			(node) =>
				typeof node === 'object' && node !== null && '@type' in node && node['@type'] === 'TechArticle'
		) as Record<string, unknown> | undefined;

		expect(techArticle?.image).toEqual({
			'@id': 'https://www.openquok.com/docs/example/plain#doc-image-1'
		});

		const logoImage = schema['@graph'].find(
			(node) =>
				typeof node === 'object' &&
				node !== null &&
				'@id' in node &&
				node['@id'] === 'https://www.openquok.com/docs/example/plain#doc-image-1'
		) as Record<string, unknown> | undefined;

		expect(logoImage).toMatchObject({
			'@type': 'ImageObject',
			caption: DOCS_FALLBACK_SOCIAL_IMAGE_ALT,
			contentUrl: `https://www.openquok.com${DOCS_FALLBACK_SOCIAL_IMAGE_SRC}`,
			encodingFormat: 'image/svg+xml',
			representativeOfPage: true
		});
	});
});
