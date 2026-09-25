import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { getRawContent } from '$lib/docs/content';
import { docsConfig } from '$lib/docs/constants';
import { absoluteDocsUrl, docsPagePath } from '$lib/docs/utils/site/docShareUrls';
import { buildLlmsTxt } from '$lib/docs/utils/site/buildLlmsTxt';

import { buildDocsFeedbackGithubIssueUrl } from './buildDocsFeedbackGithubIssueUrl';
import { mcpJsonResult } from './mcpJsonResult';
import { normalizeDocPageRef } from './normalizeDocPageRef';
import { searchDocs } from './searchDocs';

export type DocsMcpServerDeps = {
	siteUrl: string;
};

const DOCS_MCP_INSTRUCTIONS =
	'OpenQuok documentation MCP: search and read published docs, fetch the site overview (llms.txt), ' +
	'or submit feedback. Scheduling and workspace automation use the product MCP on the API host with an opo_ API key.';

export function createDocsMcpServer(deps: DocsMcpServerDeps): McpServer {
	const server = new McpServer(
		{ name: 'openquok-documentation', version: '1.0.0' },
		{ instructions: DOCS_MCP_INSTRUCTIONS }
	);

	server.registerTool(
		'search_docs',
		{
			description:
				'Search the published documentation catalog by title, description, and slug. Returns canonical URLs and short metadata.',
			inputSchema: {
				query: z.string().min(1).describe('Search terms'),
				language: z
					.string()
					.optional()
					.describe('Optional locale code (e.g. en, es). Omit for all locales.')
			}
		},
		async ({ query, language }) => {
			const results = searchDocs(query, deps.siteUrl, language);
			return mcpJsonResult({ query, results });
		}
	);

	server.registerTool(
		'read_page',
		{
			description:
				'Return raw markdown for a docs page. Pass a slug (e.g. getting-started-for-mcp) or a /docs/… path.',
			inputSchema: {
				path: z.string().min(1).describe('Doc slug or /docs/… URL path')
			}
		},
		async ({ path }) => {
			const { slug, locale } = normalizeDocPageRef(path);
			const markdown = await getRawContent(slug, locale);
			if (!markdown.trim()) {
				return {
					content: [{ type: 'text', text: `No documentation found for path: ${path}` }],
					isError: true
				};
			}
			const resolvedLocale = locale ?? docsConfig.i18n?.defaultLocale ?? 'en';
			return mcpJsonResult({
				path,
				slug,
				locale: resolvedLocale,
				url: absoluteDocsUrl(docsPagePath(slug, locale), deps.siteUrl),
				markdown
			});
		}
	);

	server.registerTool(
		'get_site_overview',
		{
			description: 'Return the same curated index as /llms.txt (product links + docs sections).'
		},
		async () => {
			const body = await buildLlmsTxt(deps.siteUrl);
			return mcpJsonResult({ siteUrl: deps.siteUrl, body });
		}
	);

	server.registerTool(
		'submit_feedback',
		{
			description:
				'Log documentation feedback and return a GitHub new-issue URL (no server-side persistence in v1).',
			inputSchema: {
				path: z.string().min(1).describe('Docs path or URL the feedback relates to'),
				message: z.string().min(1).describe('Feedback message')
			}
		},
		async ({ path, message }) => {
			const githubIssueUrl = buildDocsFeedbackGithubIssueUrl(
				docsConfig.site.social.github ?? '',
				path,
				message
			);

			console.info('[docs-mcp] submit_feedback', { path, messageLength: message.length });

			return mcpJsonResult({
				path,
				message,
				logged: true,
				githubIssueUrl
			});
		}
	);

	return server;
}
