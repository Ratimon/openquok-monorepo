import { describe, expect, it } from 'vitest';

import { preprocessMarkdownForPreview } from '$lib/skill-builder/utils/preprocessMarkdownForPreview';

describe('preprocessMarkdownForPreview', () => {
	it('leaves markdown without frontmatter unchanged', () => {
		const input = '## Heading\n\nBody text.';
		expect(preprocessMarkdownForPreview(input)).toBe(input);
	});

	it('converts YAML frontmatter into a GFM table and preserves the body', () => {
		const input = `---
name: openquok-core
version: 1.0.0
---

## Session opening

Body text.`;

		const result = preprocessMarkdownForPreview(input);

		expect(result).toContain('| **name** | openquok-core |');
		expect(result).toContain('| **version** | 1.0.0 |');
		expect(result).toContain('| --- | --- |');
		expect(result).not.toContain('<table>');
		expect(result).toContain('## Session opening');
		expect(result).toContain('Body text.');
	});

	it('renders nested frontmatter values inline in table cells', () => {
		const input = `---
prerequisites:
  commands:
    - openquok
---

## Instructions`;

		const result = preprocessMarkdownForPreview(input);

		expect(result).toContain('| **prerequisites** |');
		expect(result).toContain('**commands**: `openquok`');
		expect(result).toContain('## Instructions');
	});
});
