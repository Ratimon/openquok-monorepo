import type { LaunchStepField } from '../browser-extension/pageAssist.js';

import {
	applyLaunchFieldScalarCap,
	applyLaunchFieldScalarCoercion,
	applyLaunchFieldSelectCoercion,
	filterTagsForLaunchField,
	invalidProfileSelectForField,
	invalidProfileTagsForField,
	profileSelectPresetsForField,
} from './launchFieldConstraints.js';

const uneedTagsField: LaunchStepField = {
	key: 'tags',
	label: 'Tags',
	profilePath: 'profile_data.tags',
	fillMode: 'tags',
	tagsCatalog: 'uneed',
	maxItems: 3,
};

describe('launchFieldConstraints', () => {
	it('coerces social_x profile URLs to usernames', () => {
		const field: LaunchStepField = {
			key: 'social_x',
			label: 'Twitter username',
			profilePath: 'profile_data.social_x',
		};
		expect(
			applyLaunchFieldScalarCoercion('https://x.com/openquok', field)
		).toBe('openquok');
		expect(applyLaunchFieldScalarCoercion('@acme', field)).toBe('acme');
	});

	it('truncates scalar values for maxScalarLength', () => {
		const field: LaunchStepField = {
			key: 'tagline',
			label: 'Tagline',
			profilePath: 'tagline',
			maxScalarLength: 80,
		};
		expect(applyLaunchFieldScalarCap('x'.repeat(100), field)).toHaveLength(80);
	});

	it('filters tags to the Uneed catalog and maxItems', () => {
		const filtered = filterTagsForLaunchField(
			['SaaS', 'AI Agents', 'Not A Real Uneed Tag', 'Marketing'],
			uneedTagsField
		);
		expect(filtered).toEqual(['AI Agents', 'Marketing']);
	});

	it('flags profile tags outside the Uneed catalog', () => {
		expect(invalidProfileTagsForField(['SaaS', 'Developer Tools', 'AI'], uneedTagsField)).toEqual([
			'SaaS',
			'Developer Tools',
		]);
	});

	it('exposes Uneed category presets and coerces profile values', () => {
		const categoryField: LaunchStepField = {
			key: 'category',
			label: 'Category',
			profilePath: 'profile_data.category',
			fillMode: 'select',
			selectCatalog: 'uneed',
		};
		expect(profileSelectPresetsForField(categoryField)).toEqual([
			'Development',
			'Design',
			'Marketing',
			'Business',
		]);
		expect(applyLaunchFieldSelectCoercion('saas', categoryField)).toBe('Business');
		expect(applyLaunchFieldSelectCoercion('Marketing', categoryField)).toBe('Marketing');
		expect(invalidProfileSelectForField('SaaS', categoryField)).toBe(true);
		expect(invalidProfileSelectForField('Business', categoryField)).toBe(false);
	});
});
