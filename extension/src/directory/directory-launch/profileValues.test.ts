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
