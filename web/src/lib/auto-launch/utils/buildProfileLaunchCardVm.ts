import type { AutoLaunchExtensionConfig, AutoLaunchProfileSnapshot } from 'openquok-common';
import {
	getProfileLaunchSummary,
	type ProfileLaunchDestinationInput,
	type ProfileLaunchSubmissionInput,
	type ProfileLaunchSummary,
} from 'openquok-common';

import type {
	AutoLaunchProductProfileDto,
	AutoLaunchSubmissionDto,
} from '$lib/auto-launch/auto-launch.types';
import { resolveAutoLaunchProfileImageUrl } from '$lib/auto-launch/utils/autoLaunchProfileMediaImages';

export type ProfileLaunchDestinationForReadiness = ProfileLaunchDestinationInput;

export function destinationsToReadinessInputs(
	destinations: Array<{
		id: string;
		providerSlug: string;
		name: string;
		sortOrder: number;
		extensionConfig?: AutoLaunchExtensionConfig | null;
	}>
): ProfileLaunchDestinationForReadiness[] {
	return destinations.map((destination) => ({
		id: destination.id,
		providerSlug: destination.providerSlug,
		name: destination.name,
		sortOrder: destination.sortOrder,
		extensionConfig: destination.extensionConfig ?? {},
	}));
}

export type BusinessProfileLaunchCardVm = {
	profileId: string;
	name: string;
	tagline: string | null;
	websiteUrl: string | null;
	logoUrl: string | null;
	isLive: boolean;
	directoriesSubmittedLabel: string;
	readinessHint: string | null;
	composerTabForReadinessHint: 'discovery' | 'general' | null;
	summary: ProfileLaunchSummary;
};

const DISCOVERY_PROFILE_PATH_PREFIXES = [
	'profile_data.category',
	'profile_data.categories',
	'profile_data.use_cases',
	'profile_data.target_audiences',
	'profile_data.platforms',
	'profile_data.alternatives',
	'profile_data.monthly_revenue_usd',
];

function productProfileToLaunchSnapshot(profile: AutoLaunchProductProfileDto): AutoLaunchProfileSnapshot {
	return {
		name: profile.name,
		tagline: profile.tagline,
		description: profile.description,
		website_url: profile.websiteUrl,
		logo_url: profile.logoUrl,
		profile_data: profile.profileData as Record<string, unknown>,
		integration_customer_id: profile.integrationCustomerId,
	};
}

function submissionInputsFromDtos(
	submissions: AutoLaunchSubmissionDto[]
): ProfileLaunchSubmissionInput[] {
	return submissions.map((submission) => ({
		destinationId: submission.destinationId,
		status: submission.status,
		syncStatus: submission.syncStatus,
		completedAt: submission.completedAt,
		updatedAt: submission.updatedAt,
	}));
}

function composerTabForMissingPaths(paths: string[]): 'discovery' | 'general' {
	const usesDiscovery = paths.some((path) =>
		DISCOVERY_PROFILE_PATH_PREFIXES.some(
			(prefix) => path === prefix || path.startsWith(`${prefix}.`)
		)
	);
	return usesDiscovery ? 'discovery' : 'general';
}

function buildReadinessHint(summary: ProfileLaunchSummary): string | null {
	const gap = summary.nextGap;
	if (!gap || gap.missingFieldCount <= 0) return null;
	const fieldWord = gap.missingFieldCount === 1 ? 'field' : 'fields';
	return `Fill ${gap.missingFieldCount} more ${fieldWord} to autofill on ${gap.destinationName}`;
}

export function buildProfileLaunchCardVm(params: {
	profile: AutoLaunchProductProfileDto;
	destinations: ProfileLaunchDestinationForReadiness[];
	submissions: AutoLaunchSubmissionDto[];
}): BusinessProfileLaunchCardVm {
	const snapshot = productProfileToLaunchSnapshot(params.profile);
	const summary = getProfileLaunchSummary(
		snapshot,
		params.destinations,
		submissionInputsFromDtos(params.submissions)
	);

	const hasLogo = Boolean(params.profile.logoUrl?.trim());
	const hasWebsite = Boolean(params.profile.websiteUrl?.trim());
	const isLive = hasLogo && hasWebsite && summary.submittedCount >= 1;

	const total = summary.publishedDirectorySiteCount;
	const submitted = summary.submittedDirectorySiteCount;
	const directoriesSubmittedLabel =
		total === 0
			? '0 directories'
			: `${submitted}/${total} directories submitted`;

	const missingPaths = summary.nextGap?.missingFields.map((field) => field.path) ?? [];

	return {
		profileId: params.profile.id,
		name: params.profile.name,
		tagline: params.profile.tagline,
		websiteUrl: params.profile.websiteUrl,
		logoUrl: resolveAutoLaunchProfileImageUrl(params.profile.logoUrl),
		isLive,
		directoriesSubmittedLabel,
		readinessHint: buildReadinessHint(summary),
		composerTabForReadinessHint:
			summary.nextGap && missingPaths.length > 0
				? composerTabForMissingPaths(missingPaths)
				: null,
		summary,
	};
}
