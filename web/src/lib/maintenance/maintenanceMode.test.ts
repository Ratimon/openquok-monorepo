import { describe, expect, it } from 'vitest';

import {
	getRootPathMaintenance,
	parseMaintenanceMode,
	shouldRedirectToMaintenance
} from '$lib/maintenance/maintenanceMode';

describe('parseMaintenanceMode', () => {
	it('normalizes known modes', () => {
		expect(parseMaintenanceMode('off')).toBe('off');
		expect(parseMaintenanceMode('banner')).toBe('banner');
		expect(parseMaintenanceMode('FREEZE_WRITES')).toBe('freeze_writes');
		expect(parseMaintenanceMode('')).toBe('off');
		expect(parseMaintenanceMode('true')).toBe('off');
	});
});

describe('getRootPathMaintenance', () => {
	it('returns the maintenance segment', () => {
		expect(getRootPathMaintenance()).toBe('maintenance');
	});
});

describe('shouldRedirectToMaintenance', () => {
	it('redirects auth, app, oauth, join-org, and CLI device routes', () => {
		expect(shouldRedirectToMaintenance('/sign-in')).toBe(true);
		expect(shouldRedirectToMaintenance('/sign-up/')).toBe(true);
		expect(shouldRedirectToMaintenance('/account/calendar')).toBe(true);
		expect(shouldRedirectToMaintenance('/editor')).toBe(true);
		expect(shouldRedirectToMaintenance('/admin/feedback-manager')).toBe(true);
		expect(shouldRedirectToMaintenance('/secret-admin')).toBe(true);
		expect(shouldRedirectToMaintenance('/oauth/authorize')).toBe(true);
		expect(shouldRedirectToMaintenance('/join-org')).toBe(true);
		expect(shouldRedirectToMaintenance('/cli/device/verify')).toBe(true);
	});

	it('leaves public SEO, docs, legal, and the maintenance page itself live', () => {
		expect(shouldRedirectToMaintenance('/')).toBe(false);
		expect(shouldRedirectToMaintenance('/blog')).toBe(false);
		expect(shouldRedirectToMaintenance('/docs/getting-started-for-cli')).toBe(false);
		expect(shouldRedirectToMaintenance('/privacy-policy')).toBe(false);
		expect(shouldRedirectToMaintenance('/maintenance')).toBe(false);
		expect(shouldRedirectToMaintenance('/p/abc')).toBe(false);
		expect(shouldRedirectToMaintenance('/api/v1/blog-system/posts')).toBe(false);
	});
});
