import { describe, expect, it } from 'vitest';

import { buildCoreWorkflowMarkdown } from '$lib/skill-builder/utils/buildCoreWorkflowMarkdown';

describe('buildCoreWorkflowMarkdown', () => {
	it('renders Larry-style numbered command steps with CLI and JSON', () => {
		const markdown = buildCoreWorkflowMarkdown([
			{
				id: '1',
				type: 'command',
				kind: 'cli',
				listingSlug: 'openquok-core',
				listingTitle: 'OpenQuok Core',
				commandName: 'integrations:list',
				title: 'Discover connected channels',
				prompt: 'List channels.',
				commandTemplate: '# List all connected social channels\nopenquok integrations:list'
			},
			{
				id: '2',
				type: 'command',
				kind: 'cli',
				listingSlug: 'openquok-core',
				listingTitle: 'OpenQuok Core',
				commandName: 'posts:create',
				title: 'Schedule a post',
				prompt: 'Create a scheduled post.',
				commandTemplate: 'openquok posts:create --json ./post.json',
				examplePayload: {
					scheduledAt: '2026-01-01T12:00:00.000Z',
					status: 'scheduled',
					body: 'Caption',
					integrationIds: ['<integration-id>']
				}
			}
		]);

		expect(markdown).toContain('### 1. Discover connected channels');
		expect(markdown).toContain('openquok integrations:list');
		expect(markdown).toContain('### 2. Schedule a post');
		expect(markdown).toContain('Example `post.json` body');
		expect(markdown).toContain('"integrationIds"');
	});
});
