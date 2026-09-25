/**
 * Docs MCP is hosted on the web origin (`web/src/routes/mcp`, `web/src/lib/docs/mcp/`).
 * Product/workspace MCP stays on the API origin (`backend/mcp/`). Do not merge the two.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getMcpClientConfig, resolveMcpBaseUrl } from '$lib/developers/utils/getMcpClientConfig';
import { docsSite } from '$lib/docs/constants/config';

const thisDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(thisDir, '../../../../..');
const backendMcpDir = join(repoRoot, 'backend/mcp');
const webDocsMcpLib = thisDir;
const webDocsMcpRoute = join(repoRoot, 'web/src/routes/mcp/+server.ts');

const DOCS_MCP_TOOL_IDS = ['search_docs', 'read_page', 'get_site_overview', 'submit_feedback'] as const;

function walkTsSources(dir: string, out: string[] = []): string[] {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) {
			walkTsSources(path, out);
			continue;
		}
		if (name.endsWith('.ts') && !name.endsWith('.d.ts')) out.push(path);
	}
	return out;
}

describe('docs MCP architecture (web origin only)', () => {
	it('does not register documentation tools under backend/mcp', () => {
		expect(existsSync(backendMcpDir)).toBe(true);
		const sources = walkTsSources(backendMcpDir);
		for (const file of sources) {
			const content = readFileSync(file, 'utf8');
			for (const toolId of DOCS_MCP_TOOL_IDS) {
				expect(content, `${file} must not reference docs MCP tool ${toolId}`).not.toContain(
					toolId
				);
			}
			expect(content, `${file} must not import web docs MCP modules`).not.toMatch(
				/web\/src\/lib\/docs\/mcp|@\/lib\/docs\/mcp|\$lib\/docs\/mcp/
			);
		}
	});

	it('keeps docs MCP implementation paths under web, not backend', () => {
		expect(existsSync(webDocsMcpLib)).toBe(true);
		expect(existsSync(join(repoRoot, 'backend/mcp/tools/searchDocs.ts'))).toBe(false);
		expect(existsSync(join(repoRoot, 'backend/routes/mcp'))).toBe(false);
	});

	it('documents MCP install path is relative to the docs site, not the API', () => {
		const path = docsSite.docsMcpPath?.trim() ?? '';
		expect(path === '' || path.startsWith('/')).toBe(true);
		if (path) {
			expect(path).not.toMatch(/^https?:\/\//);
		}
	});

	it('product MCP client snippets target the API /mcp host', () => {
		const apiBase = resolveMcpBaseUrl('https://api.example.test');
		expect(apiBase).toBe('https://api.example.test');
		const { config } = getMcpClientConfig('Cursor', 'header', apiBase, 'opo_test_key');
		expect(config).toContain('https://api.example.test/mcp');
		expect(config).not.toContain('/docs/');
	});
});

describe('docs MCP HTTP route placement', () => {
	it('when shipped, lives on SvelteKit web/src/routes/mcp only', () => {
		const routeExists = existsSync(webDocsMcpRoute);
		if (!routeExists) {
			expect(existsSync(join(repoRoot, 'backend/mcp/startMcp.ts'))).toBe(true);
			return;
		}
		expect(readFileSync(webDocsMcpRoute, 'utf8')).not.toContain('backend/mcp');
	});
});
