import { describe, expect, it } from 'vitest';

import type { DocsMcpSearchIndexEntry } from './searchIndex.types';
import {
	localeMatchesSearchFilter,
	scoreSearchIndexEntry,
	searchDocsIndex,
	tokenizeSearchQuery
} from './searchDocs';

const sample: DocsMcpSearchIndexEntry[] = [
	{
		slug: 'getting-started-for-mcp/setup',
		title: 'MCP Setup',
		description: 'Connect Cursor to OpenQuok MCP servers.',
		href: '/docs/getting-started-for-mcp/setup',
		locale: 'en',
		excerpt: 'Install the product MCP on the API host with an opo_ key.'
	},
	{
		slug: 'getting-started-for-mcp/index',
		title: 'Model Context Protocol',
		description: 'Overview of MCP in OpenQuok.',
		href: '/docs/getting-started-for-mcp',
		locale: 'en',
		excerpt: 'Documentation MCP lives on the web origin at /mcp.'
	},
	{
		slug: 'getting-started-for-dev/index',
		title: 'Desarrollo',
		description: 'Guía en español.',
		href: '/docs/es/getting-started-for-dev',
		locale: 'es',
		excerpt: 'Configura tu entorno local.'
	}
];

describe('searchDocs scoring and filters', () => {
	it('tokenizes queries on whitespace', () => {
		expect(tokenizeSearchQuery('  mcp   setup ')).toEqual(['mcp', 'setup']);
		expect(tokenizeSearchQuery('')).toEqual([]);
	});

	it('scores title matches higher than excerpt', () => {
		const tokens = tokenizeSearchQuery('mcp');
		const setupScore = scoreSearchIndexEntry(sample[0], tokens);
		const overviewScore = scoreSearchIndexEntry(sample[1], tokens);
		expect(setupScore).toBeGreaterThan(overviewScore);
	});

	it('filters by language when provided', () => {
		const hits = searchDocsIndex(sample, 'entorno', 'https://www.openquok.com', 'es');
		expect(hits).toHaveLength(1);
		expect(hits[0]?.locale).toBe('es');
	});

	it('returns empty results for empty query', () => {
		expect(searchDocsIndex(sample, '   ', 'https://www.openquok.com')).toEqual([]);
	});

	it('sorts by score and caps result count', () => {
		const hits = searchDocsIndex(sample, 'mcp', 'https://www.openquok.com');
		expect(hits.length).toBeGreaterThan(1);
		expect(hits[0]!.score).toBeGreaterThanOrEqual(hits[1]!.score);
		expect(hits.every((h) => h.url.startsWith('https://www.openquok.com'))).toBe(true);
	});

	it('locale filter treats default locale code consistently', () => {
		expect(localeMatchesSearchFilter('en', 'en')).toBe(true);
		expect(localeMatchesSearchFilter('es', 'en')).toBe(false);
		expect(localeMatchesSearchFilter('en', undefined)).toBe(true);
	});
});
