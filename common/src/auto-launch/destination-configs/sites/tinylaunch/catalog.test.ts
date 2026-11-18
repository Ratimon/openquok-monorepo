import {
	coerceToTinylaunchOfficialCategory,
	matchTinylaunchOfficialCategory,
	TINYLAUNCH_OFFICIAL_CATEGORY_LABELS,
} from './config.js';

describe('TinyLaunch category catalog', () => {
	it('lists 36 official categories', () => {
		expect(TINYLAUNCH_OFFICIAL_CATEGORY_LABELS).toHaveLength(36);
	});

	it('maps discovery labels to create-startup select text', () => {
		expect(matchTinylaunchOfficialCategory('SaaS & Tools')).toBe('SaaS & Tools');
		expect(matchTinylaunchOfficialCategory('Developer Tools')).toBe('Developer Tools');
		expect(coerceToTinylaunchOfficialCategory('saas')).toBe('SaaS & Tools');
		expect(coerceToTinylaunchOfficialCategory('AI')).toBe('AI & Machine Learning');
	});
});