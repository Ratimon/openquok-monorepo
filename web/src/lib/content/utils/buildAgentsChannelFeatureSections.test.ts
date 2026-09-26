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

	it('uses the follow-up feature row when the channel has no insights bento', () => {
		const baseAgent = getPublicAgentHostBySlug('openclaw');
		const blueskyChannel = getPublicChannelBySlug('bluesky');
		const blueskyConfig = getPublicAgentChannelBySlug('openclaw', 'bluesky');

		expect(baseAgent).toBeDefined();
		expect(blueskyChannel).toBeDefined();
		expect(blueskyConfig).toBeDefined();

		const threadsSection = blueskyChannel!.featureSections.find(
			(section) => section.bentoId === 'bluesky-threads'
		);
		expect(threadsSection).toBeDefined();

		const sections = customizeAgentsChannelFeatureSections(
			baseAgent!.featureSections,
			blueskyChannel!,
			blueskyConfig!,
			'agent-host'
		);

		const analyticsRow = sections.find((section) => section.bentoId === 'bluesky-threads');
		expect(analyticsRow).toBeDefined();
		expect(analyticsRow?.subtitle).toBe('Follow-up replies');
		expect(analyticsRow?.title).toBe(threadsSection!.title);
		expect(analyticsRow?.cliCommands).toContain('bluesky-follow-up.json');
		expect(analyticsRow?.cliCommands).not.toContain('analytics:platform');
	});
});
