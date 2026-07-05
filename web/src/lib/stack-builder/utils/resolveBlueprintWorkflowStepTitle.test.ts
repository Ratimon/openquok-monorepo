import { describe, expect, it } from 'vitest';

import { resolveBlueprintWorkflowStepTitle } from '$lib/stack-builder/utils/resolveBlueprintWorkflowStepTitle';

describe('resolveBlueprintWorkflowStepTitle', () => {
	it('uses text step title when provided', () => {
		expect(
			resolveBlueprintWorkflowStepTitle({
				type: 'text',
				title: 'Generate portrait slideshow images',
				content: 'Generate six images.'
			})
		).toBe('Generate portrait slideshow images');
	});

	it('falls back for text steps without title', () => {
		expect(
			resolveBlueprintWorkflowStepTitle({
				type: 'text',
				content: 'Wait and review.'
			})
		).toBe('Workflow note');
	});

	it('uses command step title when provided', () => {
		expect(
			resolveBlueprintWorkflowStepTitle({
				type: 'command',
				listing_slug: 'openquok-core',
				command_name: 'integrations:list',
				title: 'Discover connected channels'
			})
		).toBe('Discover connected channels');
	});

	it('falls back to openquok command meta when command title is missing', () => {
		expect(
			resolveBlueprintWorkflowStepTitle({
				type: 'command',
				listing_slug: 'openquok-core',
				command_name: 'posts:create'
			})
		).toBe('Schedule a post');
	});
});
