import type {
	AutoLaunchExtensionConfig,
	AutoLaunchProfileSnapshot,
} from '../browser-extension/pageAssist.js';

import { directorySiteKeyFromProviderSlug } from './directorySiteKey.js';
import { resolveProfilePathValue } from './listingProfileFingerprint.js';

export type ProfileLaunchMissingField = {
	path: string;
	label: string;
};

export type DestinationLaunchReadiness = {
	totalFields: number;
	filledFields: number;
	missingFields: ProfileLaunchMissingField[];
	/** True when every configured fill field has a non-empty profile value (or there are zero fields). */
	isReady: boolean;
};

export type ProfileLaunchDestinationInput = {
	id: string;
	providerSlug: string;
	name: string;
	sortOrder?: number;
	extensionConfig: AutoLaunchExtensionConfig | null | undefined;
};

export type ProfileLaunchSubmissionInput = {
	destinationId: string;
	status: string;
	syncStatus: 'pending' | 'synced' | 'stale';
	completedAt?: string | null;
	updatedAt?: string | null;
};

export type ProfileLaunchSummaryNextGap = {
	destinationId: string;
	destinationName: string;
	providerSlug: string;
	missingFieldCount: number;
	totalFields: number;
	filledFields: number;
	missingFields: ProfileLaunchMissingField[];
};

export type ProfileLaunchDestinationSummaryRow = {
	destinationId: string;
	providerSlug: string;
	destinationName: string;
	readiness: DestinationLaunchReadiness;
	submissionStatus: 'none' | 'completed' | 'other';
	syncStatus: ProfileLaunchSubmissionInput['syncStatus'] | null;
};

export type ProfileLaunchSummary = {
	publishedDestinationCount: number;
	submittedCount: number;
	/** Unique directory sites (e.g. uneed, peerpush), not per launch variant. */
	publishedDirectorySiteCount: number;
	submittedDirectorySiteCount: number;
	staleCount: number;
	nextGap: ProfileLaunchSummaryNextGap | null;
	destinations: ProfileLaunchDestinationSummaryRow[];
};

/** Unique `profilePath` entries from extension config with a human label (first occurrence wins). */
export function collectProfileFieldsFromExtensionConfig(
	config: AutoLaunchExtensionConfig | null | undefined
): ProfileLaunchMissingField[] {
	const seen = new Set<string>();
	const fields: ProfileLaunchMissingField[] = [];

	for (const step of config?.steps ?? []) {
		for (const field of step.fields ?? []) {
			const profilePath = typeof field.profilePath === 'string' ? field.profilePath.trim() : '';
			if (!profilePath || seen.has(profilePath)) continue;
			seen.add(profilePath);
			const label =
				typeof field.label === 'string' && field.label.trim() ? field.label.trim() : profilePath;
			fields.push({ path: profilePath, label });
		}
	}

	return fields.sort((a, b) => a.path.localeCompare(b.path));
}

export function getDestinationReadiness(
	snapshot: AutoLaunchProfileSnapshot,
	extensionConfig: AutoLaunchExtensionConfig | null | undefined
): DestinationLaunchReadiness {
	const fieldDefs = collectProfileFieldsFromExtensionConfig(extensionConfig);
	const missingFields: ProfileLaunchMissingField[] = [];

	for (const { path, label } of fieldDefs) {
		if (resolveProfilePathValue(snapshot, path) === null) {
			missingFields.push({ path, label });
		}
	}

	const totalFields = fieldDefs.length;
	const filledFields = totalFields - missingFields.length;

	return {
		totalFields,
		filledFields,
		missingFields,
		isReady: missingFields.length === 0,
	};
}

function submissionTimestamp(submission: ProfileLaunchSubmissionInput): number {
	const raw = submission.completedAt ?? submission.updatedAt;
	if (!raw) return 0;
	const t = Date.parse(raw);
	return Number.isFinite(t) ? t : 0;
}

function pickRepresentativeSubmission(
	submissions: ProfileLaunchSubmissionInput[]
): ProfileLaunchSubmissionInput | null {
	if (submissions.length === 0) return null;

	const completed = submissions.filter((s) => s.status === 'completed');
	const pool = completed.length > 0 ? completed : submissions;

	return pool.reduce<ProfileLaunchSubmissionInput | null>((best, current) => {
		if (!best) return current;
		return submissionTimestamp(current) >= submissionTimestamp(best) ? current : best;
	}, null);
}

function compareDestinationsForNextGap(a: ProfileLaunchDestinationInput, b: ProfileLaunchDestinationInput): number {
	const sortA = a.sortOrder ?? 0;
	const sortB = b.sortOrder ?? 0;
	if (sortA !== sortB) return sortA - sortB;
	return a.name.localeCompare(b.name);
}

export function getProfileLaunchSummary(
	snapshot: AutoLaunchProfileSnapshot,
	destinations: ProfileLaunchDestinationInput[],
	submissions: ProfileLaunchSubmissionInput[]
): ProfileLaunchSummary {
	const submissionsByDestination = new Map<string, ProfileLaunchSubmissionInput[]>();
	for (const submission of submissions) {
		const list = submissionsByDestination.get(submission.destinationId) ?? [];
		list.push(submission);
		submissionsByDestination.set(submission.destinationId, list);
	}

	const destinationRows: ProfileLaunchDestinationSummaryRow[] = destinations.map((destination) => {
		const readiness = getDestinationReadiness(snapshot, destination.extensionConfig);
		const representative = pickRepresentativeSubmission(
			submissionsByDestination.get(destination.id) ?? []
		);
		const submissionStatus: ProfileLaunchDestinationSummaryRow['submissionStatus'] =
			representative?.status === 'completed'
				? 'completed'
				: representative
					? 'other'
					: 'none';

		return {
			destinationId: destination.id,
			providerSlug: destination.providerSlug,
			destinationName: destination.name,
			readiness,
			submissionStatus,
			syncStatus:
				representative?.status === 'completed' ? representative.syncStatus : null,
		};
	});

	const submittedDestinationIds = new Set(
		destinationRows.filter((row) => row.submissionStatus === 'completed').map((row) => row.destinationId)
	);

	const siteKeyByDestinationId = new Map(
		destinations.map((destination) => [
			destination.id,
			directorySiteKeyFromProviderSlug(destination.providerSlug),
		])
	);
	const publishedDirectorySiteKeys = new Set(siteKeyByDestinationId.values());
	const submittedDirectorySiteKeys = new Set<string>();
	for (const row of destinationRows) {
		if (row.submissionStatus !== 'completed') continue;
		const siteKey = siteKeyByDestinationId.get(row.destinationId);
		if (siteKey) submittedDirectorySiteKeys.add(siteKey);
	}

	const staleCount = submissions.filter((s) => s.syncStatus === 'stale').length;

	const gapCandidates = destinations
		.map((destination) => {
			const readiness = getDestinationReadiness(snapshot, destination.extensionConfig);
			if (readiness.missingFields.length === 0) return null;
			const fillRatio =
				readiness.totalFields === 0 ? 1 : readiness.filledFields / readiness.totalFields;
			return { destination, readiness, fillRatio };
		})
		.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
		.sort((a, b) => {
			if (a.fillRatio !== b.fillRatio) return a.fillRatio - b.fillRatio;
			return compareDestinationsForNextGap(a.destination, b.destination);
		});

	const firstGap = gapCandidates[0];
	const nextGap: ProfileLaunchSummaryNextGap | null = firstGap
		? {
				destinationId: firstGap.destination.id,
				destinationName: firstGap.destination.name,
				providerSlug: firstGap.destination.providerSlug,
				missingFieldCount: firstGap.readiness.missingFields.length,
				totalFields: firstGap.readiness.totalFields,
				filledFields: firstGap.readiness.filledFields,
				missingFields: firstGap.readiness.missingFields,
			}
		: null;

	return {
		publishedDestinationCount: destinations.length,
		submittedCount: submittedDestinationIds.size,
		publishedDirectorySiteCount: publishedDirectorySiteKeys.size,
		submittedDirectorySiteCount: submittedDirectorySiteKeys.size,
		staleCount,
		nextGap,
		destinations: destinationRows,
	};
}
