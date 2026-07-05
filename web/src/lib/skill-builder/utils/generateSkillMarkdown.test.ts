import { describe, expect, it } from 'vitest';

import type { QuickReferenceExtension } from '$lib/skill-builder/utils/buildQuickReferenceMarkdown';
import { generateSkillMarkdown } from '$lib/skill-builder/utils/generateSkillMarkdown';

const bloomExtension: QuickReferenceExtension = {
	slug: 'bloom-mcp',
	title: 'Bloom MCP',
	extensionType: 'mcp',
	mcpServerConfig: { name: 'bloom', url: 'https://www.trybloom.ai/api/mcp' },
	mcpTools: [
		{
			name: 'bloom_generate_image',
			description: 'Generate on-brand images from a prompt scoped to a brand session.'
		}
	]
};

describe('generateSkillMarkdown', () => {
	it('renders SKILL.md starter structure with core workflow fallback when empty', () => {
		const markdown = generateSkillMarkdown({
			extensionSlugs: ['openquok-core'],
			workflowSteps: []
		});

		expect(markdown).toContain('## Core Workflow');
		expect(markdown).toContain('**Discover**');
		expect(markdown).toContain('openquok integrations:list');
		expect(markdown).not.toContain('## Instructions');
	});

	it('includes RevenueCat prerequisites when revenuecat-mcp is selected', () => {
		const markdown = generateSkillMarkdown({
			extensionSlugs: ['openquok-core', 'revenuecat-mcp'],
			workflowSteps: []
		});

		expect(markdown).toContain('### Conversion tracking (optional but recommended for mobile apps)');
		expect(markdown).toContain('**RevenueCat MCP**');
	});

	it('renders workflow commands and text notes in SKILL.md format', () => {
		const markdown = generateSkillMarkdown({
			title: 'Test stack',
			extensionSlugs: ['openquok-core'],
			workflowSteps: [
				{
					id: '1',
					type: 'command',
					kind: 'cli',
					listingSlug: 'openquok-core',
					listingTitle: 'OpenQuok Core',
					commandName: 'integrations:list',
					title: 'Discover connected channels',
					prompt: 'List channels.',
					commandTemplate: '# List connected social channels\nopenquok integrations:list'
				},
				{
					id: '2',
					type: 'text',
					title: 'Review',
					content: 'Review the output.'
				}
			]
		});

		expect(markdown).toContain('## Core Workflow');
		expect(markdown).toContain('### 1. Discover connected channels');
		expect(markdown).toContain('### 2. Review');
		expect(markdown).toContain('Review the output.');
		expect(markdown).not.toContain('## Examples');
		expect(markdown).not.toContain('## Reference assets');
	});

	it('places Quick Reference after Core Workflow', () => {
		const markdown = generateSkillMarkdown({
			extensionSlugs: ['openquok-core'],
			workflowSteps: []
		});

		const coreWorkflowIndex = markdown.indexOf('## Core Workflow');
		const quickReferenceIndex = markdown.indexOf('## Quick Reference');

		expect(coreWorkflowIndex).toBeGreaterThan(-1);
		expect(quickReferenceIndex).toBeGreaterThan(coreWorkflowIndex);
	});

	it('adds MCP quick reference and mcp_servers frontmatter for MCP-only extensions', () => {
		const markdown = generateSkillMarkdown({
			extensionSlugs: ['openquok-core', 'bloom-mcp'],
			extensions: [bloomExtension],
			workflowSteps: [
				{
					id: '1',
					type: 'command',
					kind: 'mcp',
					listingSlug: 'bloom-mcp',
					listingTitle: 'Bloom MCP',
					commandName: 'bloom_generate_image',
					title: 'bloom generate image',
					prompt: 'Use the bloom_generate_image MCP tool from Bloom MCP.'
				}
			]
		});

		expect(markdown).toContain('mcp_servers:\n  - bloom');
		expect(markdown).toContain('### Bloom MCP');
		expect(markdown).toContain('[Generate Image](mcp://bloom/bloom_generate_image)');
		expect(markdown).toContain('### OpenQuok Core');
	});
});
