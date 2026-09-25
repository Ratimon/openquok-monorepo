import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolResultSchema, ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { describe, expect, it, afterEach } from 'vitest';

import { getRawContent } from '$lib/docs/content';
import { docsConfig } from '$lib/docs/constants';
import { buildLlmsTxt } from '$lib/docs/utils/site/buildLlmsTxt';

import { createDocsMcpServer } from './createDocsMcpServer';

const SITE = 'https://docs.example.test';

async function withDocsMcpClient<T>(
	run: (client: Client) => Promise<T>
): Promise<T> {
	const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
	const server = createDocsMcpServer({ siteUrl: SITE });
	await server.connect(serverTransport);

	const client = new Client({ name: 'vitest-docs-mcp', version: '1.0.0' });
	await client.connect(clientTransport);

	try {
		return await run(client);
	} finally {
		await client.close();
		await server.close();
	}
}

describe('docs MCP tools (read_page, get_site_overview, submit_feedback)', () => {
	afterEach(() => {
		// no shared state
	});

	it('search_docs returns ranked hits from the build index', async () => {
		await withDocsMcpClient(async (client) => {
			const result = await client.callTool(
				{ name: 'search_docs', arguments: { query: 'MCP setup' } },
				CallToolResultSchema
			);
			expect(result.isError).not.toBe(true);
			const structured = result.structuredContent as {
				results?: { slug: string; url: string; score: number }[];
			};
			expect(structured.results?.length).toBeGreaterThan(0);
			const slugs = structured.results!.map((r) => r.slug);
			expect(slugs.some((s) => s.includes('getting-started-for-mcp'))).toBe(true);
			for (const hit of structured.results ?? []) {
				expect(hit.url).toMatch(/^https:\/\/docs\.example\.test\/docs\//);
			}
		});
	});

	it('lists the v1 documentation tools', async () => {
		await withDocsMcpClient(async (client) => {
			const result = await client.request({ method: 'tools/list', params: {} }, ListToolsResultSchema);
			const names = result.tools.map((t) => t.name).sort();
			expect(names).toEqual([
				'get_site_overview',
				'read_page',
				'search_docs',
				'submit_feedback'
			]);
		});
	});

	it('read_page returns the same markdown as getRawContent for a slug', async () => {
		const slug = 'getting-started-for-mcp';
		const expected = await getRawContent(slug);
		expect(expected.trim().length).toBeGreaterThan(0);

		await withDocsMcpClient(async (client) => {
			const result = await client.callTool(
				{ name: 'read_page', arguments: { path: slug } },
				CallToolResultSchema
			);
			expect(result.isError).not.toBe(true);
			const structured = result.structuredContent as {
				markdown?: string;
				url?: string;
			};
			expect(structured.markdown).toBe(expected);
			expect(structured.url).toBe(`${SITE}/docs/${slug}`);
		});
	});

	it('read_page accepts /docs/…/markdown paths', async () => {
		const slug = 'getting-started-for-mcp/setup';
		const expected = await getRawContent(slug);

		await withDocsMcpClient(async (client) => {
			const result = await client.callTool(
				{ name: 'read_page', arguments: { path: `/docs/${slug}/markdown` } },
				CallToolResultSchema
			);
			expect(result.isError).not.toBe(true);
			const structured = result.structuredContent as { markdown?: string };
			expect(structured.markdown).toBe(expected);
		});
	});

	it('get_site_overview matches buildLlmsTxt for the site URL', async () => {
		const body = await buildLlmsTxt(SITE);

		await withDocsMcpClient(async (client) => {
			const result = await client.callTool(
				{ name: 'get_site_overview', arguments: {} },
				CallToolResultSchema
			);
			const structured = result.structuredContent as { body?: string; siteUrl?: string };
			expect(structured.siteUrl).toBe(SITE);
			expect(structured.body).toBe(body);
		});
	});

	it('submit_feedback returns a GitHub issue URL from docs config', async () => {
		await withDocsMcpClient(async (client) => {
			const result = await client.callTool(
				{
					name: 'submit_feedback',
					arguments: { path: '/docs/foo', message: 'Needs an example' }
				},
				CallToolResultSchema
			);
			const structured = result.structuredContent as {
				logged?: boolean;
				githubIssueUrl?: string | null;
			};
			expect(structured.logged).toBe(true);
			expect(structured.githubIssueUrl).toContain(
				docsConfig.site.social.github!.replace(/\/?$/, '/issues/new')
			);
		});
	});
});
