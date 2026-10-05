import { describe, expect, it } from 'vitest';

import { AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE } from '$lib/content/constants/agents/ecosystems';
import { listPublicAgentChannelsForHub } from '$lib/content/constants/agents/channels';

describe('listPublicAgentChannelsForHub', () => {
	it('sorts Meta Muse first-class channels first and sets badge labels', () => {
		const links = listPublicAgentChannelsForHub('meta-muse');
		const slugs = links.map((link) => link.slug);
		const firstClassIndex = (slug: string) => slugs.indexOf(slug);

		expect(firstClassIndex('facebook')).toBeLessThan(firstClassIndex('tiktok'));
		expect(firstClassIndex('instagram')).toBeLessThan(firstClassIndex('tiktok'));
		expect(firstClassIndex('threads')).toBeLessThan(firstClassIndex('tiktok'));

		const threads = links.find((link) => link.slug === 'threads');
		expect(threads?.badgeLabel).toBe(AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE);
	});

	it('pins X first for Grok Bot with a first-class badge', () => {
		const links = listPublicAgentChannelsForHub('grok-bot');
		expect(links[0]?.slug).toBe('x');
		expect(links[0]?.badgeLabel).toBe(AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE);
	});
});
