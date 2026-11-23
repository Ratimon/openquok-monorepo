import { coerceToDevhuntOfficialPricing, matchDevhuntOfficialPricing } from './config.js';

describe('DevHunt pricing catalog', () => {
	it('maps profile pricing_type to radio labels', () => {
		expect(coerceToDevhuntOfficialPricing('free')).toBe('Free');
		expect(coerceToDevhuntOfficialPricing('freemium')).toBe('Subscription');
		expect(coerceToDevhuntOfficialPricing('paid')).toBe('Subscription');
	});

	it('accepts official DevHunt labels', () => {
		expect(matchDevhuntOfficialPricing('One-time fee')).toBe('One-time fee');
		expect(matchDevhuntOfficialPricing('Subscription')).toBe('Subscription');
	});
});