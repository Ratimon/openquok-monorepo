import { describe, expect, it } from 'vitest';

import { getPublicAgentHostBySlug } from '$lib/content/constants/agents';
import { getPublicAgentChannelBySlug } from '$lib/content/constants/agents/channels';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';
import { buildAgentChannelLandingVm } from '$lib/content/utils/buildAgentChannelLandingVm';

function capabilitiesFaqDescription(faqItems: { title: string; description: string }[]) {
	return faqItems.find((item) => item.title.startsWith('What can ') && item.title.includes(' with '))
		?.description;
}

describe('buildAgentChannelLandingVm analytics FAQ honesty', () => {
	const baseAgent = getPublicAgentHostBySlug('openclaw');
	const facebookChannel = getPublicChannelBySlug('facebook');
	const facebookConfig = getPublicAgentChannelBySlug('openclaw', 'facebook');

	it('mentions analytics:platform for analytics-capable channels', () => {
		expect(baseAgent).toBeDefined();
		expect(facebookChannel).toBeDefined();
		expect(facebookConfig).toBeDefined();

		const vm = buildAgentChannelLandingVm({
			baseAgent: baseAgent!,
			channel: facebookChannel!,
			channelConfig: facebookConfig!
		});

		const description = capabilitiesFaqDescription(vm.faqItems);
		expect(description).toContain('analytics:platform');
		expect(description).toContain('pull platform and post analytics');
	});

	it('omits analytics claims when provider identifiers are not analytics-capable', () => {
		expect(baseAgent).toBeDefined();
		expect(facebookChannel).toBeDefined();
		expect(facebookConfig).toBeDefined();

		const vm = buildAgentChannelLandingVm({
			baseAgent: baseAgent!,
			channel: facebookChannel!,
			channelConfig: {
				...facebookConfig!,
				// Synthetic future channel — not on SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS
				providerIdentifiers: ['bluesky']
			}
		});

		const description = capabilitiesFaqDescription(vm.faqItems);
		expect(description).toBeDefined();
		expect(description).not.toContain('analytics:platform');
		expect(description).not.toContain('pull platform and post analytics');
		expect(description).toContain('draft and schedule');
		expect(description).toContain('posts:create');
	});
});
