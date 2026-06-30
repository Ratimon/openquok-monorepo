import { describe, expect, it } from 'vitest';

import { generateStackMarkdown } from '$lib/stack-builder/utils/generateStackMarkdown';

describe('generateStackMarkdown', () => {
	it('renders workflow commands, text steps, and reference assets', () => {
		const markdown = generateStackMarkdown({
			title: 'Test stack',
			extensionSlugs: ['openquok-core'],
			workflowSteps: [
				{
					id: '1',
					type: 'command',
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

		expect(markdown).toContain('# Test stack');
		expect(markdown).toContain('openquok-core · integrations:list');
		expect(markdown).toContain('Review the output.');
		expect(markdown).toContain('### Brief');
		expect(markdown).toContain('"persona": "creator"');
	});
});
