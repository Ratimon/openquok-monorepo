import { describe, expect, it } from 'vitest';
import type { AutoLaunchProfileSnapshot, LaunchStepField } from 'openquok-common';

import { mergeMainProfileSocialData, resolveLaunchProfileScalar } from './profileValues.js';

describe('mergeMainProfileSocialData', () => {
	it('inherits empty social URLs from the main profile', () => {
		const variant: AutoLaunchProfileSnapshot = {
			name: 'OpenQuok',
			profile_data: {},
		};
		const main: AutoLaunchProfileSnapshot = {
			name: 'OpenQuok',
			profile_data: {
				social_x: 'https://x.com/openquok',
				social_github: 'https://github.com/openquok',
			},
		};
		const merged = mergeMainProfileSocialData(variant, main);
		expect(merged.profile_data?.social_x).toBe('https://x.com/openquok');
		expect(merged.profile_data?.social_github).toBe('https://github.com/openquok');
	});

	it('inherits logo and gallery_urls from the main profile when the variant is empty', () => {
		const variant: AutoLaunchProfileSnapshot = {
			name: 'OpenQuok',
			logo_url: null,
			profile_data: { gallery_urls: [] },
		};
		const main: AutoLaunchProfileSnapshot = {
			name: 'OpenQuok',
			logo_url: 'https://www.openquok.com/logo.png',
			profile_data: {
				gallery_urls: ['https://www.openquok.com/a.png', 'https://www.openquok.com/b.png'],
			},
		};
		const merged = mergeMainProfileSocialData(variant, main);
		expect(merged.logo_url).toBe('https://www.openquok.com/logo.png');
		expect(merged.profile_data?.gallery_urls).toEqual([
			'https://www.openquok.com/a.png',
			'https://www.openquok.com/b.png',
		]);
	});

	it('inherits logo_label and gallery_labels with logo and gallery_urls from the main profile', () => {
		const variant: AutoLaunchProfileSnapshot = {
			name: 'OpenQuok',
			logo_url: null,
			profile_data: { gallery_urls: [] },
		};
		const main: AutoLaunchProfileSnapshot = {
			name: 'OpenQuok',
			logo_url: 'org/profile/logo.webp',
			profile_data: {
				logo_label: 'Square logo',
				gallery_urls: ['org/profile/one.png', 'org/profile/two.png'],
				gallery_labels: ['Screen one', 'Screen two'],
			},
		};
		const merged = mergeMainProfileSocialData(variant, main);
		expect(merged.profile_data?.logo_label).toBe('Square logo');
		expect(merged.profile_data?.gallery_labels).toEqual(['Screen one', 'Screen two']);
	});
});

describe('resolveLaunchProfileScalar', () => {
	it('falls back to repository_url for GitHub when social_github is empty', () => {
		const snapshot: AutoLaunchProfileSnapshot = {
			name: 'OpenQuok',
			profile_data: {
				repository_url: 'https://github.com/org/repo',
			},
		};
		const field = {
			key: 'social_github',
			label: 'GitHub',
			profilePath: 'profile_data.social_github',
			profileSourcePaths: ['profile_data.repository_url'],
		} as LaunchStepField;
		expect(resolveLaunchProfileScalar(snapshot, field, null)).toBe('https://github.com/org/repo');
	});
});
