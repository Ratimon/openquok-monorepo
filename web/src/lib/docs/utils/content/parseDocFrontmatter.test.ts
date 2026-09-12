import { describe, expect, it } from 'vitest';

import { docMetaFromRawSource } from '$lib/docs/utils/content/parseDocFrontmatter';

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
