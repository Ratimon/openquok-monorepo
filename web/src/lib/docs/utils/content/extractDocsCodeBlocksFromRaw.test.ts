import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { extractDocsCodeBlocksFromRaw } from '$lib/docs/utils/content/extractDocsCodeBlocksFromRaw';

const dockerComposeFixture = readFileSync(
	join(dirname(fileURLToPath(import.meta.url)), '../../../../content/docs/installation/docker-compose.md'),
	'utf8'
);

describe('extractDocsCodeBlocksFromRaw', () => {
	it('extracts bash fences with the nearest heading as name', () => {
		const raw = `
## Clone the repository

\`\`\`bash
git clone https://example.com/repo.git
cd repo
\`\`\`
`;

		const blocks = extractDocsCodeBlocksFromRaw(raw);
		expect(blocks).toHaveLength(1);
		expect(blocks[0]).toMatchObject({
			index: 0,
			language: 'bash',
			name: 'Clone the repository',
			text: 'git clone https://example.com/repo.git\ncd repo'
		});
	});

	it('skips text and bare fences', () => {
		const raw = `
## Notes

\`\`\`
ignored bare fence
\`\`\`

\`\`\`text
plain text fence
\`\`\`

\`\`\`typescript
const x = 1;
\`\`\`
`;

		const blocks = extractDocsCodeBlocksFromRaw(raw);
		expect(blocks).toHaveLength(1);
		expect(blocks[0]?.language).toBe('typescript');
	});

	it('parses real installation docs with multiple bash blocks', () => {
		const blocks = extractDocsCodeBlocksFromRaw(dockerComposeFixture);
		expect(blocks.length).toBeGreaterThan(0);
		expect(blocks.every((block) => block.language === 'bash')).toBe(true);
		expect(blocks[0]?.text.length).toBeGreaterThan(0);
		expect(blocks[0]?.name.length).toBeGreaterThan(0);
	});
});
