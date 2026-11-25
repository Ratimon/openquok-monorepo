import type { LaunchStepField } from '../browser-extension/pageAssist.js';

import {
	applyLaunchFieldScalarCap,
	applyLaunchFieldScalarCoercion,
	applyLaunchFieldSelectCoercion,
	coerceSocialGithubToUsername,
	coerceSocialInstagramToUsername,
	coerceSocialYoutubeToUsername,
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
	it('coerces social_x to full URL by default (Uneed / Open Launch)', () => {
		const field: LaunchStepField = {
			key: 'social_x',
			label: 'X (Twitter)',
			profilePath: 'profile_data.social_x',
		};
		expect(applyLaunchFieldScalarCoercion('openquok', field)).toBe('https://x.com/openquok');
		expect(applyLaunchFieldScalarCoercion('https://x.com/openquok', field)).toBe(
			'https://x.com/openquok'
		);
		expect(applyLaunchFieldScalarCoercion('@acme', field)).toBe('https://x.com/acme');
	});

	it('coerces social_x to username when socialScalar is username (PeerPush)', () => {
		const field: LaunchStepField = {
			key: 'social_x',
			label: 'Twitter username',
			profilePath: 'profile_data.social_x',
			socialScalar: 'username',
		};
		expect(
			applyLaunchFieldScalarCoercion('https://x.com/openquok', field)
		).toBe('openquok');
		expect(applyLaunchFieldScalarCoercion('@acme', field)).toBe('acme');
	});

	it('coerces GitHub and Instagram to usernames when socialScalar is username', () => {
		const github: LaunchStepField = {
			key: 'social_github',
			label: 'GitHub',
			profilePath: 'profile_data.social_github',
			socialScalar: 'username',
		};
		expect(applyLaunchFieldScalarCoercion('https://github.com/openquok', github)).toBe('openquok');
		const instagram: LaunchStepField = {
			key: 'social_instagram',
			label: 'Instagram',
			profilePath: 'profile_data.social_instagram',
			socialScalar: 'username',
		};
		expect(applyLaunchFieldScalarCoercion('https://instagram.com/acme', instagram)).toBe('acme');
	});

	it('coerces YouTube to username when socialScalar is username', () => {
		const youtube: LaunchStepField = {
			key: 'social_youtube',
			label: 'YouTube',
			profilePath: 'profile_data.social_youtube',
			socialScalar: 'username',
		};
		expect(applyLaunchFieldScalarCoercion('https://www.youtube.com/@openquok', youtube)).toBe(
			'openquok'
		);
		expect(applyLaunchFieldScalarCoercion('https://youtu.be/abc123', youtube)).toBe('abc123');
		expect(applyLaunchFieldScalarCoercion('@openquok', youtube)).toBe('openquok');
	});

	it('strips host paths from social profile URLs (helpers)', () => {
		expect(coerceSocialGithubToUsername('https://github.com/openquok/repo')).toBe('openquok');
		expect(coerceSocialGithubToUsername('@openquok')).toBe('openquok');
		expect(coerceSocialInstagramToUsername('https://www.instagram.com/acme/')).toBe('acme');
		expect(coerceSocialYoutubeToUsername('https://www.youtube.com/channel/UCtest123')).toBe(
			'UCtest123'
		);
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

	it('keeps the first maxItems gallery paths in profile order (directory caps)', () => {
		const galleryField: LaunchStepField = {
			key: 'gallery',
			label: 'Tool screenshots',
			profilePath: 'profile_data.gallery_urls',
			fillMode: 'files',
			maxItems: 3,
		};
		const paths = ['org/a.png', 'org/b.png', 'org/c.png', 'org/d.png', 'org/e.png'];
		expect(filterTagsForLaunchField(paths, galleryField)).toEqual([
			'org/a.png',
			'org/b.png',
			'org/c.png',
		]);
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

	it('filters Nick Launches categories to the official catalog with maxItems 3', () => {
		const categoriesField: LaunchStepField = {
			key: 'categories',
			label: 'Categories',
			profilePath: 'profile_data.categories',
			fillMode: 'tags',
			tagsCatalog: 'nick_launches_categories',
			maxItems: 3,
		};
		const filtered = filterTagsForLaunchField(
			['developer-tools', 'AI', 'Not A Real Category', 'SEO', 'Marketing'],
			categoriesField
		);
		expect(filtered).toEqual(['Developer Tools', 'AI', 'SEO']);
		expect(
			invalidProfileTagsForField(['Developer Tools', 'Imaginary'], categoriesField)
		).toEqual(['Imaginary']);
	});

	it('coerces Nick Launches pricing_type to the listing enum', () => {
		const pricingField: LaunchStepField = {
			key: 'pricing_type',
			label: 'Pricing',
			profilePath: 'profile_data.pricing_type',
			fillMode: 'select',
			selectCatalog: 'nick_launches_pricing',
		};
		expect(applyLaunchFieldSelectCoercion('Freemium', pricingField)).toBe('freemium');
		expect(applyLaunchFieldSelectCoercion('one_time', pricingField)).toBe('one_time');
		expect(invalidProfileSelectForField('custom-tier', pricingField)).toBe(true);
		expect(invalidProfileSelectForField('subscription', pricingField)).toBe(false);
	});
});
