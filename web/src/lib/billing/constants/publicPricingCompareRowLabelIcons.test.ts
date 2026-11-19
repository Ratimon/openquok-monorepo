import { describe, expect, it } from 'vitest';

import { icons } from '$data/icons';
import { publicPricingCompareRowLabelIcons } from '$lib/billing/constants/publicPricingCompareRowLabelIcons';

describe('publicPricingCompareRowLabelIcons', () => {
	it('returns overlapping icon sets for automate integration rows', () => {
		const mcpIcons = publicPricingCompareRowLabelIcons('mcp_server');
		const browserIcons = publicPricingCompareRowLabelIcons('browser_extension');
		const agentIcons = publicPricingCompareRowLabelIcons('agent_integrations');

		expect(mcpIcons?.length).toBeGreaterThanOrEqual(6);
		expect(browserIcons).toEqual([
			icons.GoogleChrome.name,
			icons.MicrosoftEdge.name,
			icons.MozillaFirefox.name
		]);
		expect(agentIcons?.length).toBeGreaterThanOrEqual(7);
		expect(agentIcons?.at(-1)).toBe(icons.Terminal.name);
	});

	it('returns channel marks for internal plugs', () => {
		expect(publicPricingCompareRowLabelIcons('internal_plugs')).toEqual([
			icons.Threads.name,
			icons.X.name,
			icons.LinkedIn.name
		]);
	});

	it('returns undefined for rows without icon stacks', () => {
		expect(publicPricingCompareRowLabelIcons('workspaces')).toBeUndefined();
	});
});