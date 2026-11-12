import type { AutoLaunchHandoffSession } from 'openquok-common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { StoredAutoLaunchState } from '../../directory/auto-launch/sessionStorage.js';

import {
	mountDirectoryProfilePools,
	resetDirectoryProfilePoolsSelectionForTests,
} from './directoryProfilePools.js';

function stateWithSnapshot(
	overrides: Partial<AutoLaunchHandoffSession['profileSnapshot']> = {},
	configFields: { profilePath: string }[] = [
		{ profilePath: 'profile_data.categories' },
		{ profilePath: 'name' },
	]
): StoredAutoLaunchState {
	const session: AutoLaunchHandoffSession = {
		submissionId: 'sub-1',
		providerSlug: 'peerpush-standard-launch',
		startUrl: 'https://peerpush.com/submit',
		profileSnapshot: {
			name: 'Acme',
			tagline: null,
			description: null,
			website_url: null,
			logo_url: null,
			profile_data: {
				categories: ['SaaS', 'Developer Tools'],
			},
			integration_customer_id: null,
			...overrides,
		},
		extensionConfig: {
			version: 1,
			startUrlPatterns: ['https://peerpush.com/*'],
			readyUrlHint: 'submit',
			steps: [
				{
					id: 'main',
					label: 'Main',
					fields: configFields.map((f, i) => ({
						key: `f${i}`,
						label: 'Field',
						profilePath: f.profilePath,
					})),
				},
			],
		},
	};

	return {
		session,
		dashboardOrigin: 'https://app.openquok.com',
		receivedAt: Date.now(),
	};
}

const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');

function stubDirectorySubmitUrl(): void {
	Object.defineProperty(window, 'location', {
		configurable: true,
		value: {
			href: 'https://peerpush.com/submit',
			pathname: '/submit',
		},
	});
}

function restoreWindowLocation(): void {
	if (locationDescriptor) {
		Object.defineProperty(window, 'location', locationDescriptor);
	}
}

describe('directoryProfilePools', () => {
	beforeEach(() => {
		resetDirectoryProfilePoolsSelectionForTests();
		stubDirectorySubmitUrl();
	});

	afterEach(() => {
		restoreWindowLocation();
	});

	it('renders highlighted discovery fields and enables fill when ready', async () => {
		const sendMessage = vi.fn((_msg: unknown, cb?: (r: unknown) => void) => {
			cb?.({ ok: true });
		});
		vi.stubGlobal('chrome', {
			runtime: { sendMessage, lastError: undefined },
		});

		const host = document.createElement('div');
		const destroy = mountDirectoryProfilePools(host, { state: stateWithSnapshot() });

		expect(host.querySelector('.profile-pool-field--highlighted')).toBeTruthy();
		expect(host.querySelector('details[open]')).toBeTruthy();

		const fillBtn = host.querySelector<HTMLButtonElement>('#profile-pools-fill-selected');
		expect(fillBtn?.disabled).toBe(true);

		const checkbox = host.querySelector<HTMLInputElement>('input[data-field-id="categories"]');
		expect(checkbox).toBeTruthy();
		checkbox!.checked = true;
		checkbox!.dispatchEvent(new Event('change', { bubbles: true }));

		expect(fillBtn?.disabled).toBe(false);

		fillBtn?.click();
		await Promise.resolve();

		expect(sendMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'AUTO_LAUNCH_FILL_FOCUSED',
				values: ['SaaS'],
				fillMode: 'auto',
				profilePath: 'profile_data.categories',
			}),
			expect.any(Function)
		);

		destroy();
		vi.unstubAllGlobals();
	});

	it('scalar fill focused sends a single value', async () => {
		const sendMessage = vi.fn((_msg: unknown, cb?: (r: unknown) => void) => {
			cb?.({ ok: true });
		});
		vi.stubGlobal('chrome', {
			runtime: { sendMessage, lastError: undefined },
		});

		const host = document.createElement('div');
		const destroy = mountDirectoryProfilePools(host, { state: stateWithSnapshot() });

		const scalarBtn = host.querySelector<HTMLButtonElement>('.profile-pool-fill-one');
		scalarBtn?.click();
		await Promise.resolve();

		expect(sendMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'AUTO_LAUNCH_FILL_FOCUSED',
				values: ['Acme'],
				profilePath: 'name',
			}),
			expect.any(Function)
		);

		destroy();
		vi.unstubAllGlobals();
	});
});
