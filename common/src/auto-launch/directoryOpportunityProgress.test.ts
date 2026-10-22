import type { ProfileLaunchDestinationSummaryRow } from './profileLaunchReadiness.js';
import { getDirectorySiteOpportunityProgress } from './directoryOpportunityProgress.js';

function variant(
	partial: Partial<ProfileLaunchDestinationSummaryRow> &
		Pick<ProfileLaunchDestinationSummaryRow, 'providerSlug'>
): ProfileLaunchDestinationSummaryRow {
	return {
		destinationId: partial.destinationId ?? crypto.randomUUID(),
		providerSlug: partial.providerSlug,
		destinationName: partial.destinationName ?? partial.providerSlug,
		readiness: partial.readiness ?? {
			totalFields: 1,
			filledFields: 1,
			missingFields: [],
			isReady: true
		},
		submissionStatus: partial.submissionStatus ?? 'none',
		syncStatus: partial.syncStatus ?? null
	};
}

describe('getDirectorySiteOpportunityProgress', () => {
	it('counts free and paid Uneed product paths as one completed slot', () => {
		const progress = getDirectorySiteOpportunityProgress([
			variant({ providerSlug: 'uneed-join-line', submissionStatus: 'completed' }),
			variant({ providerSlug: 'uneed-paid-launch', submissionStatus: 'none' }),
			variant({ providerSlug: 'uneed-maker-profile', submissionStatus: 'none' })
		]);

		expect(progress.displayLabel).toBe('1/3');
		expect(progress.completedSlots).toBe(1);
		expect(progress.requiredSlots).toBe(2);
		expect(progress.isFullyComplete).toBe(false);
	});

	it('marks site fully complete when product path and maker profile are done', () => {
		const progress = getDirectorySiteOpportunityProgress([
			variant({ providerSlug: 'uneed-paid-launch', submissionStatus: 'completed' }),
			variant({ providerSlug: 'uneed-join-line', submissionStatus: 'none' }),
			variant({ providerSlug: 'uneed-maker-profile', submissionStatus: 'completed' })
		]);

		expect(progress.displayLabel).toBe('2/3');
		expect(progress.isFullyComplete).toBe(true);
	});
});
