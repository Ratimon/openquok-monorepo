import { describe, expect, it } from 'vitest';

import {
	blogPostTableAnchorId,
	parseBlogHtmlTablesFromHtml,
	wrapBlogHtmlTablesForScroll
} from '$lib/blogs/utils/blogTables';

const decisionTable = `<table><thead><tr><th>Your priority</th><th>Lean toward</th></tr></thead><tbody><tr><td>Swap models</td><td><a href="/agents/codex">Codex</a></td></tr></tbody></table>`;

describe('parseBlogHtmlTablesFromHtml', () => {
	it('reads name from the nearest h2 and flattens cells to plain text', () => {
		const tables = parseBlogHtmlTablesFromHtml(
			`<h2>Decision table: Claude vs OpenAI for OpenQuok</h2><p>Intro</p>${decisionTable}`
		);
		expect(tables).toHaveLength(1);
		expect(tables[0]).toMatchObject({
			index: 0,
			name: 'Decision table: Claude vs OpenAI for OpenQuok',
			text: 'Your priority | Lean toward\nSwap models | Codex'
		});
	});

	it('falls back to Table N when there is no heading', () => {
		const tables = parseBlogHtmlTablesFromHtml(decisionTable);
		expect(tables[0]?.name).toBe('Table 1');
	});

	it('returns an empty list when the post has no tables', () => {
		expect(parseBlogHtmlTablesFromHtml('<p>No grid.</p>')).toEqual([]);
	});
});

describe('wrapBlogHtmlTablesForScroll ids', () => {
	it('numbers consecutive tables', () => {
		const html = wrapBlogHtmlTablesForScroll(`${decisionTable}<p>x</p>${decisionTable}`);
		expect(html).toContain(`id="${blogPostTableAnchorId(0)}"`);
		expect(html).toContain(`id="${blogPostTableAnchorId(1)}"`);
		expect(html.match(/id="blog-table-/g)?.length).toBe(2);
	});
});
