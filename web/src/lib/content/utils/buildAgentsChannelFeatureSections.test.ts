import { describe, expect, it } from 'vitest';

import { getPublicAgentHostBySlug } from '$lib/content/constants/agents';
import { getPublicAgentChannelBySlug } from '$lib/content/constants/agents/channels';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';
import { customizeAgentsChannelFeatureSections } from '$lib/content/utils/buildAgentsChannelFeatureSections';

describe('customizeAgentsChannelFeatureSections', () => {
	it('merges insights copy from the section whose bentoId ends with -insights', () => {
		const baseAgent = getPublicAgentHostBySlug('openclaw');
		const facebookChannel = getPublicChannelBySlug('facebook');
		const facebookConfig = getPublicAgentChannelBySlug('openclaw', 'facebook');

		expect(baseAgent).toBeDefined();
		expect(facebookChannel).toBeDefined();
		expect(facebookConfig).toBeDefined();

		const insightsSection = facebookChannel!.featureSections.find(
			(section) => section.bentoId === 'facebook-insights'
		);
		expect(insightsSection).toBeDefined();

		const reorderedSections = [
			insightsSection!,
			...facebookChannel!.featureSections.filter((section) => section.bentoId !== 'facebook-insights')
		];

		const sections = customizeAgentsChannelFeatureSections(
			baseAgent!.featureSections,
			{ ...facebookChannel!, featureSections: reorderedSections },
			facebookConfig!,
			'agent-host'
		);

		const analyticsRow = sections.find((section) => section.bentoId === 'facebook-insights');
		expect(analyticsRow?.title).toBe(insightsSection!.title);
		expect(analyticsRow?.description).toBe(insightsSection!.description);
		expect(analyticsRow?.description).toContain('per-Page');
	});

	it('uses channel follow-ups in the analytics slot and drops scale when analytics are unsupported', () => {
		const baseAgent = getPublicAgentHostBySlug('grok-bot');
		const skoolChannel = getPublicChannelBySlug('skool');
		const skoolConfig = getPublicAgentChannelBySlug('grok-bot', 'skool');

		expect(baseAgent).toBeDefined();
		expect(skoolChannel).toBeDefined();
		expect(skoolConfig).toBeDefined();

		const followUpsSection = skoolChannel!.featureSections.find(
			(section) => section.bentoId === 'skool-follow-ups'
		);
		expect(followUpsSection).toBeDefined();

		const sections = customizeAgentsChannelFeatureSections(
			baseAgent!.featureSections,
			skoolChannel!,
			skoolConfig!,
			'agent-host'
		);

		expect(sections.some((section) => section.subtitle === 'Scale what works')).toBe(false);
		expect(sections.some((section) => section.subtitle === 'Analytics')).toBe(false);

		const followUpRow = sections.find((section) => section.bentoId === 'skool-follow-ups');
		expect(followUpRow).toBeDefined();
		expect(followUpRow?.subtitle).toBe('Follow-up comments');
		expect(followUpRow?.title).toBe(followUpsSection!.title);
		expect(followUpRow?.cliCommands).toContain('skool-follow-up.json');
		expect(followUpRow?.cliCommands).not.toContain('analytics:platform');
	});
});
