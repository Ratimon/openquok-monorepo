import { describe, expect, it } from 'vitest';

import { generateStackMarkdown } from '$lib/stack-builder/utils/generateStackMarkdown';

describe('generateStackMarkdown', () => {
	it('renders SKILL.md starter structure with core workflow fallback when empty', () => {
		const markdown = generateStackMarkdown({
			extensionSlugs: ['openquok-core'],
			workflowSteps: [],
			referenceAssets: []
		});

		expect(markdown).toContain('## Core Workflow');
		expect(markdown).toContain('**Discover**');
		expect(markdown).toContain('openquok integrations:list');
		expect(markdown).not.toContain('## Instructions');
	});

	it('includes RevenueCat prerequisites when revenuecat-mcp is selected', () => {
		const markdown = generateStackMarkdown({
			extensionSlugs: ['openquok-core', 'revenuecat-mcp'],
			workflowSteps: [],
			referenceAssets: []
		});

		expect(markdown).toContain('### Conversion tracking (optional but recommended for mobile apps)');
		expect(markdown).toContain('**RevenueCat MCP**');
	});

	it('renders workflow commands, text notes, and reference assets in SKILL.md format', () => {
		const markdown = generateStackMarkdown({
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
			],
			referenceAssets: [
				{
					id: 'json-1',
					type: 'json',
					label: 'Brief',
					payload: '{\n  "persona": "creator"\n}'
				}
			]
		});

		expect(markdown).toContain('## Core Workflow');
		expect(markdown).toContain('### 1. Discover connected channels');
		expect(markdown).toContain('### 2. Review');
		expect(markdown).toContain('Review the output.');
		expect(markdown).toContain('## Reference assets');
	});
});
