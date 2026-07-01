import { describe, expect, it } from 'vitest';

import { generateStackMarkdown } from '$lib/stack-builder/utils/generateStackMarkdown';

describe('generateStackMarkdown', () => {
	it('renders SKILL.md starter structure with placeholder instructions when empty', () => {
		const markdown = generateStackMarkdown({
			extensionSlugs: ['openquok-core'],
			workflowSteps: [],
			referenceAssets: []
		});

		expect(markdown).toContain('---');
		expect(markdown).toContain('name: my-first-skill');
		expect(markdown).toContain('version: 1.0.0');
		expect(markdown).toContain('license: MIT');
		expect(markdown).toContain('# My First Skill');
		expect(markdown).toContain('### Step 1: Do the first thing');
		expect(markdown).toContain('### Step 3: Test it');
		expect(markdown).toContain('Built with extensions: `openquok-core`.');
	});

	it('renders workflow commands, text steps, and reference assets in SKILL.md format', () => {
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
					prompt: 'List channels.',
					commandTemplate: 'openquok integrations:list'
				},
				{
					id: '2',
					type: 'text',
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

		expect(markdown).toContain('name: test-stack');
		expect(markdown).toContain('# Test stack');
		expect(markdown).toContain('### Step 1: integrations:list');
		expect(markdown).toContain('List channels.');
		expect(markdown).toContain('openquok integrations:list');
		expect(markdown).toContain('### Step 2');
		expect(markdown).toContain('Review the output.');
		expect(markdown).toContain('## Reference assets');
		expect(markdown).toContain('### Brief');
		expect(markdown).toContain('"persona": "creator"');
	});
});
