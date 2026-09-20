import { describe, expect, it } from 'vitest';

import { getPublicMcpLandingBySlug } from '$lib/content/constants/mcps/index';
import {
	buildPublicMcpSetupStepsSeoSchemas,
	createPublicSetupStepsSEOSchema
} from '$lib/content/utils/createPublicSetupStepsSEOSchema';

describe('createPublicSetupStepsSEOSchema', () => {
	it('maps FeaturesOrdered steps to HowTo JSON-LD', () => {
		const node = createPublicSetupStepsSEOSchema({
			pageUrl: 'https://www.openquok.com/social-media-posting-api',
			sectionTitle: 'Add social media,to your product in three steps',
			sectionSubtitle: 'Three steps',
			sectionDescription: 'Connect once, then publish through the same API.',
			steps: [
				{
					id: 1,
					title: '1. Get your programmatic token',
					content: 'Sign up and create an opo_ token.',
					iconName: 'OpenQuok'
				},
				{
					id: 2,
					title: '2. Connect your channels',
					content: 'Connect networks in the dashboard.',
					iconName: 'Link'
				}
			]
		});

		expect(node).toMatchObject({
			'@type': 'HowTo',
			'@id': 'https://www.openquok.com/social-media-posting-api#setup-steps',
			name: 'Add social media to your product in three steps',
			description: 'Connect once, then publish through the same API.',
			step: [
				{
					'@type': 'HowToStep',
					position: 1,
					name: '1. Get your programmatic token',
					text: 'Sign up and create an opo_ token.'
				},
				{
					'@type': 'HowToStep',
					position: 2,
					name: '2. Connect your channels',
					text: 'Connect networks in the dashboard.'
				}
			]
		});
	});

	it('returns empty object when steps are missing', () => {
		expect(
			createPublicSetupStepsSEOSchema({
				pageUrl: 'https://example.com/agents/openclaw',
				sectionTitle: 'Five steps,to OpenClaw + OpenQuok',
				steps: []
			})
		).toEqual({});
	});

	it('emits MCP and skill HowTo nodes for MCP landing pages', () => {
		const cursor = getPublicMcpLandingBySlug('cursor');
		expect(cursor).toBeDefined();
		if (!cursor) return;

		const nodes = buildPublicMcpSetupStepsSeoSchemas({
			pageUrl: 'https://www.openquok.com/agents/cursor',
			page: cursor
		});

		expect(nodes).toHaveLength(2);
		expect(nodes[0]).toMatchObject({
			'@type': 'HowTo',
			'@id': 'https://www.openquok.com/agents/cursor#setup-steps'
		});
		expect(nodes[1]).toMatchObject({
			'@type': 'HowTo',
			'@id': 'https://www.openquok.com/agents/cursor#skill-setup-steps'
		});
	});
});
