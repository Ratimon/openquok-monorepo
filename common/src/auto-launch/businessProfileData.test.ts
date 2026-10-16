import {
	BUSINESS_PROFILE_MAX_TAGS,
	mergeBusinessProfileData,
	normalizeBusinessProfileData,
} from './businessProfileData.js';

describe('mergeBusinessProfileData', () => {
	it('overlays patch keys onto existing profile_data', () => {
		const merged = mergeBusinessProfileData(
			{ pricing_type: 'free', social_x: 'https://x.test/old' },
			{ pricing_type: 'paid', tags: ['saas'] }
		);
		expect(merged).toEqual({
			pricing_type: 'paid',
			social_x: 'https://x.test/old',
			tags: ['saas'],
		});
	});

	it('treats missing existing as empty object', () => {
		expect(mergeBusinessProfileData(null, { category: 'devtools' })).toEqual({
			category: 'devtools',
		});
	});
});

describe('normalizeBusinessProfileData', () => {
	it('trims tags and drops empty entries', () => {
		expect(
			normalizeBusinessProfileData({
				tags: ['  alpha ', '', 'beta'],
			})
		).toEqual({ tags: ['alpha', 'beta'] });
	});

	it('ignores unknown pricing_type values', () => {
		expect(
			normalizeBusinessProfileData({
				pricing_type: 'enterprise',
			})
		).toEqual({});
	});
});

describe('BUSINESS_PROFILE_MAX_TAGS', () => {
	it('is three', () => {
		expect(BUSINESS_PROFILE_MAX_TAGS).toBe(3);
	});
});
