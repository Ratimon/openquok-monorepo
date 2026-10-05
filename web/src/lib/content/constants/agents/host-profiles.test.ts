import { describe, expect, it } from 'vitest';

import { AGENT_HOST_ECOSYSTEM_BY_SLUG } from '$lib/content/constants/agents/ecosystems';
import { getAgentHostProfile } from '$lib/content/constants/agents/host-profiles';
import { PUBLIC_AGENT_HOST_LANDING_PAGES } from '$lib/content/constants/agents/seeds';

describe('AGENT_HOST_PROFILES', () => {
	it('defines a profile for every registered agent host landing', () => {
		for (const page of PUBLIC_AGENT_HOST_LANDING_PAGES) {
			const profile = getAgentHostProfile(page.slug);
			expect(profile, `missing profile for ${page.slug}`).toBeDefined();
			expect(profile?.slug).toBe(page.slug);
		}
	});

	it('defines a profile for every host slug in AGENT_HOST_ECOSYSTEM_BY_SLUG', () => {
		for (const slug of Object.keys(AGENT_HOST_ECOSYSTEM_BY_SLUG)) {
			const profile = getAgentHostProfile(slug);
			expect(profile, `missing profile for ecosystem host ${slug}`).toBeDefined();
			expect(profile?.slug).toBe(slug);
		}
	});

	it('maps ecosystem slugs only to registered PUBLIC_AGENT_HOST_LANDING_PAGES', () => {
		const registeredSlugs = new Set(
			PUBLIC_AGENT_HOST_LANDING_PAGES.map((page) => page.slug)
		);
		for (const slug of Object.keys(AGENT_HOST_ECOSYSTEM_BY_SLUG)) {
			expect(
				registeredSlugs.has(slug),
				`ecosystem map references unknown host slug: ${slug}`
			).toBe(true);
		}
	});
});
