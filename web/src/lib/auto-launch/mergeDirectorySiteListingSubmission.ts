import type { AutoLaunchSubmissionDto } from '$lib/auto-launch/auto-launch.types';
import type { DirectoryLaunchSiteSummaryRow } from '$lib/auto-launch/groupDirectoryLaunchSiteSummaryRows';
import type { ProfileLaunchDestinationSummaryRow } from 'openquok-common';

const EMPTY = '—';

function pickSiteSubmission(
	variants: ProfileLaunchDestinationSummaryRow[],
	submissionsByDestinationId: ReadonlyMap<string, AutoLaunchSubmissionDto>
): AutoLaunchSubmissionDto | null {
	let bestCompleted: AutoLaunchSubmissionDto | null = null;
	let fallback: AutoLaunchSubmissionDto | null = null;

	for (const variant of variants) {
		const submission = submissionsByDestinationId.get(variant.destinationId);
		if (!submission) continue;
		if (!fallback) fallback = submission;
		if (submission.status !== 'completed') continue;
		if (
			!bestCompleted ||
			(submission.completedAt &&
				(!bestCompleted.completedAt || submission.completedAt > bestCompleted.completedAt))
		) {
			bestCompleted = submission;
		}
	}

	return bestCompleted ?? fallback;
}

export type DirectorySiteListingFields = {
	listUrl: string | null;
	listUrlDisplay: string;
	listingDofollow: boolean;
	listingDofollowDisplay: string;
	authEmail: string | null;
	authEmailDisplay: string;
	primaryDestinationId: string;
	submissionId: string | null;
};

export function mergeOpportunityListingSubmission(
	variant: ProfileLaunchDestinationSummaryRow,
	submissionsByDestinationId: ReadonlyMap<string, AutoLaunchSubmissionDto>
): DirectorySiteListingFields {
	const submission = submissionsByDestinationId.get(variant.destinationId) ?? null;
	const destinationId = variant.destinationId;

	return {
		listUrl: submission?.listingUrl ?? null,
		listUrlDisplay: submission?.listingUrl?.trim() || EMPTY,
		listingDofollow: submission?.listingDofollow ?? false,
		listingDofollowDisplay: submission ? (submission.listingDofollow ? 'Yes' : 'No') : EMPTY,
		authEmail: submission?.authEmail ?? null,
		authEmailDisplay: submission?.authEmail?.trim() || EMPTY,
		primaryDestinationId: destinationId,
		submissionId: submission?.id ?? null
	};
}

export function mergeDirectorySiteListingSubmission(
	site: DirectoryLaunchSiteSummaryRow,
	submissionsByDestinationId: ReadonlyMap<string, AutoLaunchSubmissionDto>
): DirectorySiteListingFields {
	const primaryDestinationId = site.variants[0]?.destinationId ?? '';
	const submission = pickSiteSubmission(site.variants, submissionsByDestinationId);
	const destinationId = submission?.destinationId ?? primaryDestinationId;

	return {
		listUrl: submission?.listingUrl ?? null,
		listUrlDisplay: submission?.listingUrl?.trim() || EMPTY,
		listingDofollow: submission?.listingDofollow ?? false,
		listingDofollowDisplay: submission ? (submission.listingDofollow ? 'Yes' : 'No') : EMPTY,
		authEmail: submission?.authEmail ?? null,
		authEmailDisplay: submission?.authEmail?.trim() || EMPTY,
		primaryDestinationId: destinationId,
		submissionId: submission?.id ?? null
	};
}
