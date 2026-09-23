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
});
