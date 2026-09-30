import { describe, expect, it } from 'vitest';

import {
	expressFlatComparePlansPerChannel,
	getOpenQuokSoloCompareChannelCount,
	resolveComparePricingDefaultChannelCount,
	scaleComparePlansToChannelTotal
} from '$lib/content/constants/competitors/utils/comparePricing';

describe('comparePricing', () => {
	it('uses OpenQuok Solo channel total as default for OpenQuok-led pairs', () => {
		const baseline = getOpenQuokSoloCompareChannelCount();
		expect(baseline).toBeGreaterThan(0);
		expect(
			resolveComparePricingDefaultChannelCount('openquok', 'buffer', 'flat', 'per_channel')
		).toBe(baseline);
	});

	it('scales Buffer Essentials to total monthly at N channels', () => {
		const plans = [
			{
				name: 'Essentials',
				monthlyPrice: 6,
				tagline: 'Paid',
				footnote: 'From $6/channel / month'
			}
		];
		const scaled = scaleComparePlansToChannelTotal(plans, 'per_channel', 15);
		expect(scaled[0]?.monthlyPrice).toBe(90);
	});

	it('scales Hopper HQ Grow per-account list price to channel total', () => {
		const plans = [{ name: 'Grow', monthlyPrice: 6, tagline: 'Per account' }];
		const scaled = scaleComparePlansToChannelTotal(plans, 'per_channel', 15);
		expect(scaled[0]?.monthlyPrice).toBe(90);
	});
});
