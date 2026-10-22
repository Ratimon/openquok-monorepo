import { describe, expect, it } from 'vitest';

import {
	AGENTS_HUB_CLOUD_BROWSER_VS_OPENQUOK_FAQ,
	buildAgentCloudBrowserVsOpenQuokFaqAnswer
} from '$lib/content/constants/agents/agentCloudSchedulingFaq';

describe('agentCloudSchedulingFaq', () => {
	it('states official APIs and avoids social passwords in chat', () => {
		const answer = buildAgentCloudBrowserVsOpenQuokFaqAnswer('Grok Bot');
		expect(answer).toContain('official');
		expect(answer.toLowerCase()).toContain('password');
		expect(answer.toLowerCase()).toContain('ban');
	});

	it('hub FAQ links Grok Bot landing', () => {
		expect(AGENTS_HUB_CLOUD_BROWSER_VS_OPENQUOK_FAQ.description).toContain('/agents/grok-bot');
	});
});
