import { describe, expect, it } from 'vitest';

import {
	inlineCodeShouldRenderAsBadge,
	markdownToHtml,
	parseInlineMarkdown,
	parseListingMarkdown
} from '$lib/listings/utils/listingMarkdown';

describe('inlineCodeShouldRenderAsBadge', () => {
	it('flags CLI commands and API keys', () => {
		expect(inlineCodeShouldRenderAsBadge('auth:login --json --no-poll')).toBe(true);
		expect(inlineCodeShouldRenderAsBadge('opo_abc123')).toBe(true);
		expect(inlineCodeShouldRenderAsBadge('openquok auth:status')).toBe(true);
		expect(inlineCodeShouldRenderAsBadge('website')).toBe(false);
	});
});

describe('parseInlineMarkdown', () => {
	it('parses bold and badge-worthy code', () => {
		const segments = parseInlineMarkdown('Use `auth:login --json --no-poll` on hosts.');
		expect(segments).toEqual([
			{ type: 'text', text: 'Use ' },
			{ type: 'code', text: 'auth:login --json --no-poll', asBadge: true },
			{ type: 'text', text: ' on hosts.' }
		]);
	});
});

describe('parseListingMarkdown', () => {
	it('parses auth tables from SKILL.md-style bodies', () => {
		const markdown = `## Authentication

| Order | Path | Use |
|-------|------|-----|
| 1 | **Device OAuth (two steps)** | Messaging agents: \`auth:login --json --no-poll\` |
| 2 | **Programmatic token** | \`export OPENQUOK_API_KEY=opo_…\` |

\`\`\`bash
openquok auth:login --json --no-poll
\`\`\`
`;
		const blocks = parseListingMarkdown(markdown);
		expect(blocks[0]).toEqual({ type: 'heading', level: 2, text: 'Authentication' });
		expect(blocks[1]?.type).toBe('table');
		if (blocks[1]?.type === 'table') {
			expect(blocks[1].headers).toEqual(['Order', 'Path', 'Use']);
			expect(blocks[1].rows).toHaveLength(2);
		}
		expect(blocks[2]?.type).toBe('code');
	});

	it('renders tables through markdownToHtml', () => {
		const html = markdownToHtml('| A | B |\n|---|---|\n| 1 | 2 |');
		expect(html).toContain('<table>');
		expect(html).toContain('<th>A</th>');
		expect(html).toContain('<td>2</td>');
	});
});
