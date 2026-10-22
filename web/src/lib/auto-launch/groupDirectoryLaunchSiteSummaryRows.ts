import {
	directorySiteKeyFromProviderSlug,
	type DestinationLaunchReadiness,
	type ProfileLaunchDestinationSummaryRow
} from 'openquok-common';

export type DirectoryLaunchSiteSummaryRow = {
	siteKey: string;
	siteLabel: string;
	variants: ProfileLaunchDestinationSummaryRow[];
	readiness: DestinationLaunchReadiness;
	submissionStatus: ProfileLaunchDestinationSummaryRow['submissionStatus'];
	syncStatus: ProfileLaunchDestinationSummaryRow['syncStatus'];
};

const SITE_LABEL_OVERRIDES: Record<string, string> = {
	peerpush: 'PeerPush',
	uneed: 'Uneed'
};

function siteLabelFromDestinationName(destinationName: string): string | null {
	const dash = destinationName.indexOf(' — ');
	if (dash === -1) return null;
	return destinationName.slice(0, dash).trim() || null;
}

function siteLabelForKey(
	siteKey: string,
	variants: ProfileLaunchDestinationSummaryRow[]
): string {
	const fromName = variants.map((v) => siteLabelFromDestinationName(v.destinationName)).find(Boolean);
	if (fromName) return fromName;
	const override = SITE_LABEL_OVERRIDES[siteKey];
	if (override) return override;
	return siteKey.charAt(0).toUpperCase() + siteKey.slice(1);
}

function pickRepresentativeReadiness(
	variants: ProfileLaunchDestinationSummaryRow[]
): DestinationLaunchReadiness {
	const incomplete = variants.filter((row) => row.submissionStatus !== 'completed');
	const pool = incomplete.length > 0 ? incomplete : variants;
	let best = pool[0]?.readiness;
	if (!best) {
		return { totalFields: 0, filledFields: 0, missingFields: [], isReady: true };
	}
	for (const row of pool) {
		if (row.readiness.missingFields.length < best.missingFields.length) {
			best = row.readiness;
		}
	}
	return best;
}

function aggregateSubmission(
	variants: ProfileLaunchDestinationSummaryRow[]
): Pick<DirectoryLaunchSiteSummaryRow, 'submissionStatus' | 'syncStatus'> {
	const completed = variants.filter((row) => row.submissionStatus === 'completed');
	if (completed.length > 0) {
		const stale = completed.some((row) => row.syncStatus === 'stale');
		const pending = completed.some((row) => row.syncStatus === 'pending');
		return {
			submissionStatus: 'completed',
			syncStatus: stale ? 'stale' : pending ? 'pending' : 'synced'
		};
	}
	if (variants.some((row) => row.submissionStatus === 'other')) {
		return { submissionStatus: 'other', syncStatus: null };
	}
	return { submissionStatus: 'none', syncStatus: null };
}

/** One row per directory site (Uneed, PeerPush), not per launch opportunity variant. */
export function groupDirectoryLaunchSiteSummaryRows(
	rows: ProfileLaunchDestinationSummaryRow[]
): DirectoryLaunchSiteSummaryRow[] {
	const bySite = new Map<string, ProfileLaunchDestinationSummaryRow[]>();

	for (const row of rows) {
		const siteKey = directorySiteKeyFromProviderSlug(row.providerSlug);
		const bucket = bySite.get(siteKey) ?? [];
		bucket.push(row);
		bySite.set(siteKey, bucket);
	}

	const siteRows: DirectoryLaunchSiteSummaryRow[] = [];

	for (const [siteKey, variants] of bySite) {
		const sortedVariants = [...variants].sort((a, b) =>
			a.destinationName.localeCompare(b.destinationName, undefined, { sensitivity: 'base' })
		);
		siteRows.push({
			siteKey,
			siteLabel: siteLabelForKey(siteKey, sortedVariants),
			variants: sortedVariants,
			readiness: pickRepresentativeReadiness(sortedVariants),
			...aggregateSubmission(sortedVariants)
		});
	}

	siteRows.sort((a, b) =>
		a.siteLabel.localeCompare(b.siteLabel, undefined, { sensitivity: 'base' })
	);

	return siteRows;
}
