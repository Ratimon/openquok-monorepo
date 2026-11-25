import {
	coerceToAlternativetoOfficialLicense,
	filterToAlternativetoOfficialPlatforms,
	mapBusinessProfilePricingToAlternativetoLicense,
	matchAlternativetoOfficialLicense,
	matchAlternativetoOfficialPlatform,
} from './config.js';

describe('AlternativeTo platform catalog', () => {
	it('maps common profile platform chips to official labels', () => {
		expect(matchAlternativetoOfficialPlatform('web')).toBe('Online');
		expect(matchAlternativetoOfficialPlatform('SaaS')).toBe('SaaS');
		expect(matchAlternativetoOfficialPlatform('macOS')).toBe('Mac');
		expect(matchAlternativetoOfficialPlatform('PlayStation')).toBeNull();
	});

	it('dedupes filtered platform labels', () => {
		expect(filterToAlternativetoOfficialPlatforms(['web', 'Online', 'saas'])).toEqual([
			'Online',
			'SaaS',
		]);
	});
});

describe('AlternativeTo license catalog', () => {
	it('maps pricing type and open source to license labels', () => {
		expect(mapBusinessProfilePricingToAlternativetoLicense('free')).toBe('Free');
		expect(mapBusinessProfilePricingToAlternativetoLicense('paid')).toBe('Commercial');
		expect(mapBusinessProfilePricingToAlternativetoLicense('freemium', true)).toBe('Open Source');
	});

	it('coerces select values', () => {
		expect(matchAlternativetoOfficialLicense('Commercial')).toBe('Commercial');
		expect(coerceToAlternativetoOfficialLicense('paid')).toBe('Commercial');
		expect(coerceToAlternativetoOfficialLicense('freemium', { isOpenSource: true })).toBe(
			'Open Source'
		);
	});
});