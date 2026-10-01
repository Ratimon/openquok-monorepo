import { describe, expect, it } from 'vitest';

import { PUBLIC_AGENT_HOST_LANDING_PAGES } from '$lib/content/constants/agents/seeds';
import { getAgentHostProfile } from '$lib/content/constants/agents/host-profiles';

describe('AGENT_HOST_PROFILES', () => {
	it('defines a profile for every registered agent host landing', () => {
		for (const page of PUBLIC_AGENT_HOST_LANDING_PAGES) {
			const profile = getAgentHostProfile(page.slug);
			expect(profile, `missing profile for ${page.slug}`).toBeDefined();
			expect(profile?.slug).toBe(page.slug);
		}
	});
});
