import type {
	AutoLaunchExtensionConfig,
	AutoLaunchProfileSnapshot,
} from '../browser-extension/pageAssist.js';
import {
	highlightPathsForDestination,
	listProfilePoolSections,
	resolveProfilePathArray,
} from './profileFieldCatalog.js';

function snapshot(
	overrides: Partial<AutoLaunchProfileSnapshot> = {}
): AutoLaunchProfileSnapshot {
	return {
		name: 'Acme',
		tagline: 'Ship faster',
		description: '<p>Product description</p>',
		website_url: 'https://acme.test',
		logo_url: null,
		profile_data: {},
		integration_customer_id: null,
		...overrides,
	};
}

describe('resolveProfilePathArray', () => {
	it('returns trimmed string array entries in order', () => {
		const snap = snapshot({
			profile_data: { categories: [' SaaS ', 'AI', ''] },
		});
		expect(resolveProfilePathArray(snap, 'profile_data.categories')).toEqual(['SaaS', 'AI']);
	});

	it('wraps a single string as one item', () => {
		const snap = snapshot({ logo_url: '  media/logo.png  ' });
		expect(resolveProfilePathArray(snap, 'logo_url')).toEqual(['media/logo.png']);
	});

	it('returns empty array when unset', () => {
		expect(resolveProfilePathArray(snapshot(), 'profile_data.use_cases')).toEqual([]);
	});

});

describe('listProfilePoolSections', () => {
	it('includes discovery arrays and scalar values from snapshot', () => {
		const snap = snapshot({
			profile_data: {
				categories: ['Developer Tools'],
				use_cases: ['launch', 'b2b'],
				pricing_type: 'freemium',
			},
		});

		const sections = listProfilePoolSections(snap);
		const discovery = sections.find((s) => s.id === 'discovery');
		const categories = discovery?.fields.find((f) => f.id === 'categories');
		const useCases = discovery?.fields.find((f) => f.id === 'use_cases');
		const main = sections.find((s) => s.id === 'main');
		const pricing = main?.fields.find((f) => f.id === 'pricing_type');

		expect(categories?.items).toEqual(['Developer Tools']);
		expect(useCases?.items).toEqual(['launch', 'b2b']);
		expect(pricing?.value).toBe('freemium');
		expect(discovery?.fields.map((f) => f.id)).toEqual([
			'categories',
			'use_cases',
			'target_audiences',
			'platforms',
			'tech_stack',
		]);
	});

	it('omits sell section when sell fields are empty', () => {
		const sections = listProfilePoolSections(snapshot());
		expect(sections.some((s) => s.id === 'sell')).toBe(false);
	});

	it('includes sell section when acquisition is listed', () => {
		const sections = listProfilePoolSections(
			snapshot({ profile_data: { acquisition_listed: true } })
		);
		const sell = sections.find((s) => s.id === 'sell');
		const listed = sell?.fields.find((f) => f.id === 'acquisition_listed');
		expect(listed?.booleanValue).toBe(true);
	});

	it('marks fields highlighted from extension config', () => {
		const config: AutoLaunchExtensionConfig = {
			version: 1,
			steps: [
				{
					id: 'discovery',
					label: 'Discovery',
					fields: [
						{
							key: 'categories',
							label: 'Categories',
							profilePath: 'profile_data.categories',
						},
						{
							key: 'use_cases',
							label: 'Use cases',
							profilePath: 'profile_data.use_cases',
						},
					],
				},
			],
		};

		const sections = listProfilePoolSections(snapshot(), { extensionConfig: config });
		const discovery = sections.find((s) => s.id === 'discovery');
		const categories = discovery?.fields.find((f) => f.id === 'categories');
		const useCases = discovery?.fields.find((f) => f.id === 'use_cases');
		const techStack = discovery?.fields.find((f) => f.id === 'tech_stack');

		expect(categories?.highlighted).toBe(true);
		expect(useCases?.highlighted).toBe(true);
		expect(techStack?.highlighted).toBe(false);
	});
});

describe('highlightPathsForDestination', () => {
	it('matches collectProfilePathsFromExtensionConfig paths', () => {
		const config: AutoLaunchExtensionConfig = {
			version: 1,
			steps: [
				{
					id: 'main',
					label: 'Main',
					fields: [{ key: 'name', label: 'Name', profilePath: 'name' }],
				},
			],
		};
		expect(highlightPathsForDestination(config)).toEqual(new Set(['name']));
	});
});
