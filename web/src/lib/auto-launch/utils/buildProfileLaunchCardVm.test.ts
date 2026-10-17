import { describe, expect, it } from 'vitest';

import { EMPTY_BUSINESS_PROFILE_DATA } from 'openquok-common';

import { buildProfileLaunchCardVm } from '$lib/auto-launch/utils/buildProfileLaunchCardVm';
import type { AutoLaunchProductProfileDto } from '$lib/auto-launch/auto-launch.types';

function profile(overrides: Partial<AutoLaunchProductProfileDto> = {}): AutoLaunchProductProfileDto {
	return {
		id: 'profile-1',
		organizationId: 'org-1',
		integrationCustomerId: null,
		name: 'Acme',
		tagline: 'Ship faster',
		description: 'Desc',
		websiteUrl: 'https://acme.test',
		logoUrl: null,
		profileData: { ...EMPTY_BUSINESS_PROFILE_DATA },
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	};
}

describe('buildProfileLaunchCardVm', () => {
	it('builds aggregate labels and readiness hint from destinations with extension config', () => {
		const vm = buildProfileLaunchCardVm({
			profile: profile(),
			destinations: [
				{
					id: 'dest-a',
					providerSlug: 'uneed-join-line',
					name: 'Uneed',
					sortOrder: 1,
					extensionConfig: {
						steps: [
							{
								id: 's1',
								label: 'Step',
								fields: [
									{ key: 'name', label: 'Name', profilePath: 'name' },
									{ key: 'logo', label: 'Logo', profilePath: 'logo_url' },
								],
							},
						],
					},
				},
			],
			submissions: [],
		});

		expect(vm.directoriesSubmittedLabel).toBe('0/1 directories submitted');
		expect(vm.readinessHint).toBe('Fill 1 more field to autofill on Uneed');
		expect(vm.composerTabForReadinessHint).toBe('general');
		expect(vm.isLive).toBe(false);
	});

	it('aggregates submitted count by directory site, not per launch variant', () => {
		const joinConfig = {
			steps: [
				{
					id: 's1',
					label: 'Step',
					fields: [{ key: 'name', label: 'Name', profilePath: 'name' }],
				},
			],
		};
		const vm = buildProfileLaunchCardVm({
			profile: profile(),
			destinations: [
				{
					id: 'dest-uneed-join',
					providerSlug: 'uneed-join-line',
					name: 'Uneed — Join the line',
					sortOrder: 1,
					extensionConfig: joinConfig,
				},
				{
					id: 'dest-uneed-paid',
					providerSlug: 'uneed-paid-launch',
					name: 'Uneed — Paid launch',
					sortOrder: 2,
					extensionConfig: joinConfig,
				},
				{
					id: 'dest-peerpush',
					providerSlug: 'peerpush-standard-launch',
					name: 'PeerPush — Standard launch',
					sortOrder: 3,
					extensionConfig: joinConfig,
				},
			],
			submissions: [],
		});

		expect(vm.directoriesSubmittedLabel).toBe('0/2 directories submitted');
	});

	it('marks live when logo, website, and a completed submission exist', () => {
		const vm = buildProfileLaunchCardVm({
			profile: profile({ logoUrl: 'org/profile/logo.webp' }),
			destinations: [
				{
					id: 'dest-a',
					providerSlug: 'peerpush-standard-launch',
					name: 'PeerPush',
					extensionConfig: {
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
								],
							},
						],
					},
				},
			],
			submissions: [
				{
					id: 'sub-1',
					organizationId: 'org-1',
					productProfileId: 'profile-1',
					destinationId: 'dest-a',
					status: 'completed',
					listingUrl: null,
					intentCreatedAt: null,
					completedAt: '2026-01-02T00:00:00.000Z',
					listingSyncedAt: null,
					syncStatus: 'synced',
					createdAt: '2026-01-01T00:00:00.000Z',
					updatedAt: '2026-01-02T00:00:00.000Z',
				},
			],
		});

		expect(vm.isLive).toBe(true);
		expect(vm.composerTabForReadinessHint).toBe('discovery');
	});
});
