import { describe, expect, it } from 'vitest';

import {
	buildQuickReferenceMarkdown,
	collectMcpServerNames,
	resolveMcpServerName,
	type QuickReferenceExtension
} from '$lib/skill-builder/utils/buildQuickReferenceMarkdown';

const bloomExtension: QuickReferenceExtension = {
	slug: 'bloom-mcp',
	title: 'Bloom MCP',
	extensionType: 'mcp',
	mcpServerConfig: { name: 'bloom', url: 'https://www.trybloom.ai/api/mcp' },
	mcpTools: [
		{
			name: 'bloom_onboard_brand',
			description: 'Onboard a brand from a website or Instagram URL.'
		},
		{
			name: 'bloom_generate_image',
			description: 'Generate on-brand images from a prompt scoped to a brand session.'
		}
	]
};

describe('buildQuickReferenceMarkdown', () => {
	it('resolves MCP server name from config with slug fallback', () => {
		expect(resolveMcpServerName(bloomExtension)).toBe('bloom');
		expect(
			resolveMcpServerName({
				...bloomExtension,
				mcpServerConfig: null,
				slug: 'revenuecat-mcp'
			})
		).toBe('revenuecat');
	});

	it('lists MCP-only server names for frontmatter', () => {
		expect(
			collectMcpServerNames([
				bloomExtension,
				{
					slug: 'openquok-core',
					title: 'OpenQuok Core',
					extensionType: 'both',
					mcpServerConfig: { name: 'openquok' },
					mcpTools: [{ name: 'integrationList', description: 'List channels.' }]
				}
			])
		).toEqual(['bloom']);
	});

	it('renders CLI and MCP subsections with mcp:// tool links', () => {
		const markdown = buildQuickReferenceMarkdown(
			[bloomExtension],
			['openquok-core', 'bloom-mcp']
		);

		expect(markdown).toContain('### OpenQuok Core');
		expect(markdown).toContain('```bash');
		expect(markdown).toContain('openquok auth:status');
		expect(markdown).toContain('### Bloom MCP');
		expect(markdown).toContain('[Onboard Brand](mcp://bloom/bloom_onboard_brand)');
		expect(markdown).toContain('[Generate Image](mcp://bloom/bloom_generate_image)');
		expect(markdown).not.toContain('mcp://openquok/');
	});
});
