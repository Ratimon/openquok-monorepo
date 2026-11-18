import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mountDashboardSessionBar } from './dashboardSessionBar.js';

vi.mock('../../shared/dashboardAuth.js', () => ({
	isDashboardLoggedIn: vi.fn(),
	hasDashboardSessionCookie: vi.fn(),
}));

vi.mock('../../shared/requestDashboardSessionSync.js', () => ({
	requestDashboardSessionSyncFromOpenTabs: vi.fn().mockResolvedValue(undefined),
	waitMs: vi.fn().mockResolvedValue(undefined),
}));

const { isDashboardLoggedIn } = await import('../../shared/dashboardAuth.js');

describe('mountDashboardSessionBar', () => {
	let host: HTMLElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.replaceChildren(host);
		vi.mocked(isDashboardLoggedIn).mockReset();
	});

	it('publishes signed_out after refresh when not logged in', async () => {
		vi.mocked(isDashboardLoggedIn).mockResolvedValue({
			loggedIn: false,
			loginUrl: 'https://www.openquok.com/sign-in',
		});

		const bar = mountDashboardSessionBar(host);
		const snapshots: string[] = [];
		bar.subscribe((s) => snapshots.push(s.status));

		await bar.refresh();

		expect(snapshots).toContain('checking');
		expect(bar.getSnapshot().status).toBe('signed_out');
		expect(host.querySelector('#dashboard-sign-in-cloud')).not.toBeNull();
	});

	it('shows checking UI on mount before refresh completes', () => {
		const bar = mountDashboardSessionBar(host);

		expect(bar.getSnapshot().status).toBe('checking');
		expect(host.textContent).toContain('Checking your OpenQuok session');
	});

	it('notifies subscribers with the current snapshot immediately', async () => {
		vi.mocked(isDashboardLoggedIn).mockResolvedValue({
			loggedIn: false,
			loginUrl: 'https://www.openquok.com/sign-in',
		});

		const bar = mountDashboardSessionBar(host);
		let latest: string | undefined;
		bar.subscribe((s) => {
			latest = s.status;
		});

		expect(latest).toBe('checking');
		await bar.refresh();
		expect(latest).toBe('signed_out');
	});

	it('publishes signed_in with dashboard origin when logged in', async () => {
		vi.mocked(isDashboardLoggedIn).mockResolvedValue({
			loggedIn: true,
			loginUrl: 'https://www.openquok.com/sign-in',
		});

		const bar = mountDashboardSessionBar(host);
		await bar.refresh();

		expect(bar.getSnapshot()).toEqual({
			status: 'signed_in',
			dashboardOrigin: 'https://www.openquok.com',
			loginUrl: 'https://www.openquok.com/sign-in',
		});
		expect(host.querySelector('#dashboard-disconnect')).not.toBeNull();
	});
});