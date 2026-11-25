import {
	coerceToNickLaunchesOfficialPricing,
	filterToNickLaunchesOfficialCategories,
	matchNickLaunchesOfficialCategory,
	matchNickLaunchesOfficialPricing,
} from './config.js';

describe('Nick Launches category catalog', () => {
	it('maps names and slugs to official category labels', () => {
		expect(matchNickLaunchesOfficialCategory('developer-tools')).toBe('Developer Tools');
		expect(matchNickLaunchesOfficialCategory('health and fitness')).toBe('Health & Fitness');
		expect(matchNickLaunchesOfficialCategory('AI')).toBe('AI');
	});

	it('drops values that are not in the category catalog', () => {
		expect(filterToNickLaunchesOfficialCategories(['SaaS', 'SEO', 'seo'])).toEqual(['SEO']);
	});
});

describe('Nick Launches pricing catalog', () => {
	it('maps profile pricing_type and display aliases to the listing enum', () => {
		expect(coerceToNickLaunchesOfficialPricing('free')).toBe('free');
		expect(coerceToNickLaunchesOfficialPricing('Freemium')).toBe('freemium');
		expect(coerceToNickLaunchesOfficialPricing('One-time fee')).toBe('one_time');
		expect(coerceToNickLaunchesOfficialPricing('Contact')).toBe('contact');
	});

	it('accepts official pricing enum values', () => {
		expect(matchNickLaunchesOfficialPricing('subscription')).toBe('subscription');
		expect(matchNickLaunchesOfficialPricing('one_time')).toBe('one_time');
		expect(matchNickLaunchesOfficialPricing('custom')).toBeNull();
	});
});
