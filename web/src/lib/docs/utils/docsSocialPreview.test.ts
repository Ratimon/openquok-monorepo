import { describe, expect, it } from 'vitest';

import { orderDocsImagesForSeo, pickDocsSocialPreview } from '$lib/docs/utils/docsSocialPreview';
import type { DocsImageFromRaw } from '$lib/docs/utils/extractDocsImagesFromRaw';
import { docMetaFromRawSource } from '$lib/docs/utils/parse-doc-frontmatter';

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

		expect(preview?.src).toBe('/docs/_assets/getting-started/1-workspace-dashboard.webp');
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

describe('docMetaFromRawSource ogImage', () => {
	it('parses ogImage and ogImageAlt from frontmatter', () => {
		const meta = docMetaFromRawSource(`---
title: Quickstart
description: Example
ogImage: /docs/_assets/getting-started/5-kanban-board.webp
ogImageAlt: Kanban preview
---`);

		expect(meta.ogImage).toBe('/docs/_assets/getting-started/5-kanban-board.webp');
		expect(meta.ogImageAlt).toBe('Kanban preview');
	});
});
