import { describe, expect, it } from 'vitest';

import { resolveDirectoryTabNavigationUrl } from './directoryTabNavigationUrl.js';

describe('resolveDirectoryTabNavigationUrl', () => {
	it('keeps the user on a StartupInspire dashboard path', () => {
		const tabUrl = 'https://www.startupinspire.com/dashboard/startup/edit/1';
		expect(
			resolveDirectoryTabNavigationUrl(
				'startupinspire-free-listing',
				tabUrl,
				'https://www.startupinspire.com/pricing'
			)
		).toBe(tabUrl);
	});

	it('maps legacy pricing start URLs to the dashboard', () => {
		expect(
			resolveDirectoryTabNavigationUrl(
				'startupinspire-free-listing',
				undefined,
				'https://www.startupinspire.com/pricing'
			)
		).toBe('https://www.startupinspire.com/dashboard');
	});

	it('leaves other directory providers unchanged', () => {
		const url = 'https://peerpush.com/pricing';
		expect(resolveDirectoryTabNavigationUrl('peerpush-standard-launch', undefined, url)).toBe(url);
	});
});