import { describe, expect, it } from 'vitest';

import {
	filterToOpenLaunchOfficialCategories,
	filterToOpenLaunchOfficialPlatforms,
	matchOpenLaunchOfficialCategory,
	matchOpenLaunchOfficialPlatform,
	coerceToOpenLaunchOfficialPricing,
} from './openLaunch.js';

describe('Open Launch category catalog', () => {
	it('maps discovery labels to submit-form checkbox text', () => {
		expect(matchOpenLaunchOfficialCategory('SaaS')).toBe('SaaS');
		expect(matchOpenLaunchOfficialCategory('Marketing')).toBe('Marketing Tools');
		expect(matchOpenLaunchOfficialCategory('Developer Tools')).toBe('Developer Tools');
	});

	it('filters profile categories to at most official labels', () => {
		expect(
			filterToOpenLaunchOfficialCategories(['SaaS', 'Marketing', 'Not A Real Category'])
		).toEqual(['SaaS', 'Marketing Tools']);
	});
});

describe('Open Launch platform catalog', () => {
	it('maps discovery platforms to Open Launch options', () => {
		expect(matchOpenLaunchOfficialPlatform('Web')).toBe('Web');
		expect(matchOpenLaunchOfficialPlatform('API')).toBe('Api');
		expect(matchOpenLaunchOfficialPlatform('MCP')).toBe('Other');
	});

	it('dedupes mapped platforms', () => {
		expect(filterToOpenLaunchOfficialPlatforms(['Web', 'API', 'CLI', 'MCP'])).toEqual([
			'Web',
			'Api',
			'Other',
		]);
	});
});

describe('Open Launch pricing catalog', () => {
	it('coerces profile pricing_type to radio labels', () => {
		expect(coerceToOpenLaunchOfficialPricing('freemium')).toBe('Freemium');
		expect(coerceToOpenLaunchOfficialPricing('paid')).toBe('Paid');
	});
});
