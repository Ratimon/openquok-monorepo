import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
	docsTableAnchorId,
	extractDocsTablesFromRaw
} from '$lib/docs/utils/content/extractDocsTablesFromRaw';

const connectRulesFixture = readFileSync(
	join(dirname(fileURLToPath(import.meta.url)), '../../../../content/docs/platforms/connect-rules.md'),
	'utf8'
);

describe('extractDocsTablesFromRaw', () => {
	it('extracts GFM tables with the nearest heading as name', () => {
		const raw = `
## How you connect it

| Connect type | What you do |
| --- | --- |
| **OAuth** | You sign in on the platform. |
| **Credentials in OpenQuok** | You paste your own API key. |
`;

		const tables = extractDocsTablesFromRaw(raw);
		expect(tables).toHaveLength(1);
		expect(tables[0]).toMatchObject({
			index: 0,
			name: 'How you connect it',
			text: 'Connect type | What you do\nOAuth | You sign in on the platform.\nCredentials in OpenQuok | You paste your own API key.'
		});
		expect(docsTableAnchorId(0)).toBe('doc-table-1');
	});

	it('skips pipe rows inside fenced code', () => {
		const raw = `
## Notes

\`\`\`bash
| not | a | table |
| --- | --- | --- |
| skip | this | row |
\`\`\`

| Real | Table |
| --- | --- |
| yes | here |
`;

		const tables = extractDocsTablesFromRaw(raw);
		expect(tables).toHaveLength(1);
		expect(tables[0]?.text).toBe('Real | Table\nyes | here');
	});

	it('parses connect-rules.md platform tables', () => {
		const tables = extractDocsTablesFromRaw(connectRulesFixture);
		expect(tables.length).toBeGreaterThanOrEqual(2);
		expect(tables[0]?.text).toContain('Connect type | What you do');
		expect(tables[0]?.text).toContain('OAuth');
		expect(tables[1]?.text).toContain('Display name | Channel key');
		expect(tables[1]?.text).toContain('threads');
		expect(tables[1]?.text).toContain('devto');
	});
});
