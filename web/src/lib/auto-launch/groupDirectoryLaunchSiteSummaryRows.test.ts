import { describe, expect, it } from 'vitest';

import type { ProfileLaunchDestinationSummaryRow } from 'openquok-common';

import { groupDirectoryLaunchSiteSummaryRows } from './groupDirectoryLaunchSiteSummaryRows';

function row(
	partial: Partial<ProfileLaunchDestinationSummaryRow> &
		Pick<ProfileLaunchDestinationSummaryRow, 'providerSlug' | 'destinationName'>
): ProfileLaunchDestinationSummaryRow {
	return {
		destinationId: partial.destinationId ?? crypto.randomUUID(),
		providerSlug: partial.providerSlug,
		destinationName: partial.destinationName,
		readiness: partial.readiness ?? {
			totalFields: 3,
			filledFields: 1,
			missingFields: [{ path: 'name', label: 'Name' }, { path: 'logo_url', label: 'Logo' }],
			isReady: false
		},
		submissionStatus: partial.submissionStatus ?? 'none',
		syncStatus: partial.syncStatus ?? null
	};
}

describe('groupDirectoryLaunchSiteSummaryRows', () => {
	it('collapses launch variants into one row per directory site', () => {
		const siteRows = groupDirectoryLaunchSiteSummaryRows([
			row({
				providerSlug: 'uneed-join-line',
				destinationName: 'Uneed — Join the line',
				readiness: {
					totalFields: 10,
					filledFields: 5,
					missingFields: Array(5).fill({ path: 'x', label: 'X' }),
					isReady: false
				}
			}),
			row({
				providerSlug: 'uneed-paid-launch',
				destinationName: 'Uneed — Paid launch',
				readiness: {
					totalFields: 10,
					filledFields: 3,
					missingFields: Array(7).fill({ path: 'x', label: 'X' }),
					isReady: false
				}
			}),
			row({
				providerSlug: 'peerpush-standard-launch',
				destinationName: 'PeerPush — Standard launch',
				readiness: {
					totalFields: 12,
					filledFields: 0,
					missingFields: Array(12).fill({ path: 'x', label: 'X' }),
					isReady: false
				}
			})
		]);

		expect(siteRows).toHaveLength(2);
		expect(siteRows.map((s) => s.siteLabel).sort()).toEqual(['PeerPush', 'Uneed']);
		const uneed = siteRows.find((s) => s.siteKey === 'uneed');
		expect(uneed?.variants).toHaveLength(2);
		expect(uneed?.readiness.missingFields).toHaveLength(5);
	});

	it('marks site completed when any variant is completed', () => {
		const siteRows = groupDirectoryLaunchSiteSummaryRows([
			row({
				providerSlug: 'uneed-join-line',
				destinationName: 'Uneed — Join the line',
				submissionStatus: 'completed',
				syncStatus: 'synced'
			}),
			row({
				providerSlug: 'uneed-paid-launch',
				destinationName: 'Uneed — Paid launch',
				submissionStatus: 'none'
			})
		]);

		expect(siteRows[0]?.submissionStatus).toBe('completed');
		expect(siteRows[0]?.syncStatus).toBe('synced');
	});
});
