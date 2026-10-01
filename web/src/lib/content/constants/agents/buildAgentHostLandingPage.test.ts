import { describe, expect, it } from 'vitest';

import { buildAgentHostLandingPage } from '$lib/content/constants/agents/buildAgentHostLandingPage';
import { openclawAgentSeed } from '$lib/content/constants/agents/hosts/openclaw';

describe('buildAgentHostLandingPage', () => {
	it('builds messaging-gateway setup and feature sections for OpenClaw', () => {
		const page = buildAgentHostLandingPage(openclawAgentSeed);

		expect(page.pageType).toBe('agent-host');
		expect(page.setupSteps).toHaveLength(5);
		expect(page.featureSections).toHaveLength(4);
		expect(page.featureSections[1]?.bentoId).toBe('agent-multi-platform-bulk-scheduling');
		expect(page.setupStepsTitle).toBe('Five steps,to OpenClaw + OpenQuok');
		expect(page.faqItems).toHaveLength(10);
		expect(page.faqItems[1]?.title).toContain('Grok Bot');
	});

	it('applies overrides.faqItemsAfterFirst after the first default FAQ', () => {
		const page = buildAgentHostLandingPage(openclawAgentSeed);
		expect(page.faqItems[0]?.title).toBe('What is OpenClaw?');
		expect(page.faqItems[1]?.title).toBe('How do I pick OpenClaw vs Grok Bot or Dots?');
	});
});
