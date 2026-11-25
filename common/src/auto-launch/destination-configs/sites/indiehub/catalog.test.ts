import { filterToIndiehubOfficialCategories, matchIndiehubOfficialCategory } from './config.js';

describe('IndieHub category catalog', () => {
	it('maps names and slugs to official category labels', () => {
		expect(matchIndiehubOfficialCategory('ai')).toBe('AI');
		expect(matchIndiehubOfficialCategory('open-source')).toBe('Open Source');
		expect(matchIndiehubOfficialCategory('Developer Tools')).toBeNull();
	});

	it('drops values that are not in the category catalog', () => {
		expect(filterToIndiehubOfficialCategories(['SaaS', 'Productivity', 'productivity'])).toEqual([
			'Productivity',
		]);
	});
});