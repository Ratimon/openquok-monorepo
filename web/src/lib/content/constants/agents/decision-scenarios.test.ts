import { describe, expect, it } from 'vitest';

import {
	AGENT_HOST_DECISION_SCENARIOS,
	buildAgentHostPickerFaqDescription,
	listAgentHostSlugsForScenario
} from '$lib/content/constants/agents/decision-scenarios';

describe('AGENT_HOST_DECISION_SCENARIOS', () => {
	it('lists grok-bot for many-named-agents scenario', () => {
		expect(listAgentHostSlugsForScenario('many-named-agents-cloud-desktop')).toContain('grok-bot');
	});

	it('lists openclaw and hermes for self-hosted control', () => {
		const slugs = listAgentHostSlugsForScenario('self-hosted-data-control');
		expect(slugs).toContain('openclaw');
		expect(slugs).toContain('hermes');
	});

	it('has unique scenario ids', () => {
		const ids = AGENT_HOST_DECISION_SCENARIOS.map((scenario) => scenario.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('buildAgentHostPickerFaqDescription', () => {
	it('links to the scenario blog for dots', () => {
		const html = buildAgentHostPickerFaqDescription('dots');
		expect(html).toContain('grok-bot-vs-openclaw-pick-your-openquok-social-scheduler-agent');
		expect(html).toContain('Grok Bot');
		expect(html).toContain('OpenClaw');
	});
});
