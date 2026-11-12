import {
	BUSINESS_PROFILE_MAX_TAGS,
	deriveListingTags,
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

	it('normalizes discovery list fields', () => {
		expect(
			normalizeBusinessProfileData({
				categories: [' SaaS '],
				use_cases: ['launch'],
				target_audiences: [' founders '],
				platforms: ['Web'],
				tech_stack: [' Next.js ', 'PostgreSQL'],
				alternatives: ['  Other Tool  '],
			})
		).toEqual({
			categories: ['SaaS'],
			use_cases: ['launch'],
			target_audiences: ['founders'],
			platforms: ['Web'],
			tech_stack: ['Next.js', 'PostgreSQL'],
			alternatives: ['Other Tool'],
		});
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
	it('allows more than legacy three-tag directory limits', () => {
		expect(BUSINESS_PROFILE_MAX_TAGS).toBeGreaterThan(3);
	});
});

describe('deriveListingTags', () => {
	it('concatenates discovery dimensions in catalog order', () => {
		expect(
			deriveListingTags({
				categories: ['SaaS'],
				use_cases: ['launch'],
				target_audiences: ['founders'],
				platforms: ['Web'],
				tech_stack: ['Next.js'],
			})
		).toEqual(['SaaS', 'launch', 'founders', 'Web', 'Next.js']);
	});

	it('dedupes across dimensions and trims entries', () => {
		expect(
			deriveListingTags({
				categories: ['  SaaS ', 'devtools'],
				use_cases: ['SaaS'],
				platforms: ['Web'],
			})
		).toEqual(['SaaS', 'devtools', 'Web']);
	});

	it('caps at BUSINESS_PROFILE_MAX_TAGS', () => {
		const many = Array.from({ length: BUSINESS_PROFILE_MAX_TAGS + 5 }, (_, i) => `tag-${i}`);
		expect(
			deriveListingTags({
				categories: many.slice(0, 20),
				use_cases: many.slice(20),
			})
		).toHaveLength(BUSINESS_PROFILE_MAX_TAGS);
	});

	it('returns empty when no dimensions are set', () => {
		expect(deriveListingTags({})).toEqual([]);
		expect(deriveListingTags(null)).toEqual([]);
	});
});
