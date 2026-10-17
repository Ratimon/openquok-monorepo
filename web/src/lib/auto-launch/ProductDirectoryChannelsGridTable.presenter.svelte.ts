import type { IColumn } from '@svar-ui/svelte-grid';
import type { DestinationLaunchReadiness } from 'openquok-common';
import { getDirectorySiteOpportunityProgress } from 'openquok-common';

import type { AutoLaunchSubmissionDto } from '$lib/auto-launch/auto-launch.types';
import type { DirectoryLaunchSiteSummaryRow } from '$lib/auto-launch/groupDirectoryLaunchSiteSummaryRows';
import {
	mergeOpportunityListingSubmission
} from '$lib/auto-launch/mergeDirectorySiteListingSubmission';

import DirectoryChannelsGridActionsCell from '$lib/ui/components/auto-launch/DirectoryChannelsGridActionsCell.svelte';
import DirectoryChannelsGridDirectoryCell from '$lib/ui/components/auto-launch/DirectoryChannelsGridDirectoryCell.svelte';
import DirectoryChannelsGridListUrlCell from '$lib/ui/components/auto-launch/DirectoryChannelsGridListUrlCell.svelte';
import DirectoryChannelsGridReadinessCell from '$lib/ui/components/auto-launch/DirectoryChannelsGridReadinessCell.svelte';
import DirectoryChannelsGridStatusCell from '$lib/ui/components/auto-launch/DirectoryChannelsGridStatusCell.svelte';

export type ProductDirectoryChannelRowKind = 'site' | 'opportunity';

export type ProductDirectoryChannelTableRowViewModel = {
	id: string;
	rowKind: ProductDirectoryChannelRowKind;
	siteKey: string;
	siteLabel: string;
	opportunityLabel: string;
	providerSlug: string;
	listUrl: string | null;
	listUrlDisplay: string;
	listingDofollow: boolean;
	listingDofollowDisplay: string;
	authEmail: string | null;
	authEmailDisplay: string;
	primaryDestinationId: string;
	submissionId: string | null;
	variantOptions: { destinationId: string; label: string }[];
	readinessDisplay: string;
	submissionDisplay: string;
	readiness: DestinationLaunchReadiness;
	submissionStatus: DirectoryLaunchSiteSummaryRow['submissionStatus'];
	syncStatus: DirectoryLaunchSiteSummaryRow['syncStatus'];
	showLaunch: boolean;
	showRefill: boolean;
	opportunityCount: number;
	siteProgressLabel: string;
	siteProgressFullyComplete: boolean;
	isSiteExpanded: boolean;
};

const READINESS_COL_WIDTH = 132;
const SUBMISSION_COL_WIDTH = 120;
const DOFOLLOW_COL_WIDTH = 88;
const AUTH_EMAIL_COL_WIDTH = 148;
const ACTIONS_COL_WIDTH_MIN = 200;
const ACTIONS_COL_WIDTH_MAX = 248;
const LIST_URL_MIN_WIDTH = 72;
const DIRECTORY_MIN_WIDTH = 168;
const DIRECTORY_FLEX_SHARE = 0.58;
const GRID_WIDTH_GUTTER = 24;

const EMPTY = '—';

function readinessLabel(readiness: DestinationLaunchReadiness): string {
	if (readiness.totalFields === 0) return 'No autofill fields';
	if (readiness.isReady) return 'Ready';
	const count = readiness.missingFields.length;
	return count === 1 ? '1 field missing' : `${count} fields missing`;
}

function opportunitySubmissionLabel(
	submissionStatus: DirectoryLaunchSiteSummaryRow['submissionStatus'],
	syncStatus: DirectoryLaunchSiteSummaryRow['syncStatus']
): string {
	if (submissionStatus === 'completed') {
		if (syncStatus === 'synced') return 'Synced';
		if (syncStatus === 'stale') return 'Profile changed';
		if (syncStatus === 'pending') return 'Sync pending';
		return 'Submitted';
	}
	if (submissionStatus === 'other') return 'In progress';
	return 'Not submitted';
}

function opportunityShortLabel(destinationName: string): string {
	const dash = destinationName.indexOf(' — ');
	if (dash === -1) return destinationName;
	return destinationName.slice(dash + 3).trim() || destinationName;
}

function buildGridColumns(
	directoryColumnWidth: number,
	listUrlWidth: number,
	actionsColumnWidth: number
): IColumn[] {
	return [
		{
			id: 'siteLabel',
			header: 'Directory',
			width: directoryColumnWidth,
			cell: DirectoryChannelsGridDirectoryCell,
			tooltip: false
		},
		{
			id: 'listUrlDisplay',
			header: 'List URL',
			width: listUrlWidth,
			cell: DirectoryChannelsGridListUrlCell,
			tooltip: false
		},
		{
			id: 'listingDofollowDisplay',
			header: 'Dofollow',
			width: DOFOLLOW_COL_WIDTH,
			tooltip: false
		},
		{
			id: 'authEmailDisplay',
			header: 'Auth email',
			width: AUTH_EMAIL_COL_WIDTH,
			tooltip: false
		},
		{
			id: 'readinessDisplay',
			header: 'Readiness',
			width: READINESS_COL_WIDTH,
			cell: DirectoryChannelsGridReadinessCell,
			tooltip: false
		},
		{
			id: 'submissionDisplay',
			header: 'Submission',
			width: SUBMISSION_COL_WIDTH,
			cell: DirectoryChannelsGridStatusCell,
			tooltip: false
		},
		{
			id: 'actions',
			header: 'Actions',
			width: actionsColumnWidth,
			cell: DirectoryChannelsGridActionsCell,
			tooltip: false
		}
	] as unknown as IColumn[];
}

function actionsColumnWidthForHost(hostWidthPx: number): number {
	if (hostWidthPx <= 0) return ACTIONS_COL_WIDTH_MAX;
	return Math.min(
		ACTIONS_COL_WIDTH_MAX,
		Math.max(ACTIONS_COL_WIDTH_MIN, Math.floor(hostWidthPx * 0.26))
	);
}

function buildOpportunityRow(
	site: DirectoryLaunchSiteSummaryRow,
	variant: DirectoryLaunchSiteSummaryRow['variants'][number],
	submissionsByDestinationId: ReadonlyMap<string, AutoLaunchSubmissionDto>
): ProductDirectoryChannelTableRowViewModel {
	const listing = mergeOpportunityListingSubmission(variant, submissionsByDestinationId);
	const showLaunch = variant.submissionStatus !== 'completed';
	const showRefill = variant.submissionStatus === 'completed' && variant.syncStatus === 'stale';

	return {
		id: `${site.siteKey}:${variant.destinationId}`,
		rowKind: 'opportunity',
		siteKey: site.siteKey,
		siteLabel: site.siteLabel,
		opportunityLabel: opportunityShortLabel(variant.destinationName),
		providerSlug: variant.providerSlug,
		listUrl: listing.listUrl,
		listUrlDisplay: listing.listUrlDisplay,
		listingDofollow: listing.listingDofollow,
		listingDofollowDisplay: listing.listingDofollowDisplay,
		authEmail: listing.authEmail,
		authEmailDisplay: listing.authEmailDisplay,
		primaryDestinationId: variant.destinationId,
		submissionId: listing.submissionId,
		variantOptions: [{ destinationId: variant.destinationId, label: variant.destinationName }],
		readinessDisplay: readinessLabel(variant.readiness),
		submissionDisplay: opportunitySubmissionLabel(variant.submissionStatus, variant.syncStatus),
		readiness: variant.readiness,
		submissionStatus: variant.submissionStatus,
		syncStatus: variant.syncStatus,
		showLaunch,
		showRefill,
		opportunityCount: site.variants.length,
		siteProgressLabel: '',
		siteProgressFullyComplete: false,
		isSiteExpanded: false
	};
}

function buildSiteRow(
	site: DirectoryLaunchSiteSummaryRow,
	progress: ReturnType<typeof getDirectorySiteOpportunityProgress>,
	isExpanded: boolean
): ProductDirectoryChannelTableRowViewModel {
	const showRefill =
		site.submissionStatus === 'completed' && site.syncStatus === 'stale' && progress.isFullyComplete;

	return {
		id: site.siteKey,
		rowKind: 'site',
		siteKey: site.siteKey,
		siteLabel: site.siteLabel,
		opportunityLabel: '',
		providerSlug: '',
		listUrl: null,
		listUrlDisplay: EMPTY,
		listingDofollow: false,
		listingDofollowDisplay: EMPTY,
		authEmail: null,
		authEmailDisplay: EMPTY,
		primaryDestinationId: site.variants[0]?.destinationId ?? '',
		submissionId: null,
		variantOptions: site.variants.map((variant) => ({
			destinationId: variant.destinationId,
			label: variant.destinationName
		})),
		readinessDisplay: readinessLabel(site.readiness),
		submissionDisplay: progress.displayLabel,
		readiness: site.readiness,
		submissionStatus: site.submissionStatus,
		syncStatus: site.syncStatus,
		showLaunch: !progress.isFullyComplete,
		showRefill,
		opportunityCount: site.variants.length,
		siteProgressLabel: progress.displayLabel,
		siteProgressFullyComplete: progress.isFullyComplete,
		isSiteExpanded: isExpanded
	};
}

/** SVAR grid for directory channels on a business profile card (Products tab). */
export class ProductDirectoryChannelsGridTablePresenter {
	siteRowsVm = $state<DirectoryLaunchSiteSummaryRow[]>([]);
	submissionsByDestinationIdVm = $state<Map<string, AutoLaunchSubmissionDto>>(new Map());

	refreshRowsFromSiteRows(
		siteRows: readonly DirectoryLaunchSiteSummaryRow[],
		submissionsByDestinationId: ReadonlyMap<string, AutoLaunchSubmissionDto>
	): void {
		this.siteRowsVm = [...siteRows].sort((a, b) =>
			a.siteLabel.localeCompare(b.siteLabel, undefined, { sensitivity: 'base' })
		);
		this.submissionsByDestinationIdVm = new Map(submissionsByDestinationId);
	}

	buildAllOpportunityRows(): ProductDirectoryChannelTableRowViewModel[] {
		const rows: ProductDirectoryChannelTableRowViewModel[] = [];
		for (const site of this.siteRowsVm) {
			for (const variant of site.variants) {
				rows.push(buildOpportunityRow(site, variant, this.submissionsByDestinationIdVm));
			}
		}
		return rows;
	}

	buildDisplayRows(
		expandedSiteKeys: ReadonlySet<string>,
		filter: (row: ProductDirectoryChannelTableRowViewModel) => boolean,
		filterActive: boolean
	): ProductDirectoryChannelTableRowViewModel[] {
		const rows: ProductDirectoryChannelTableRowViewModel[] = [];

		for (const site of this.siteRowsVm) {
			const progress = getDirectorySiteOpportunityProgress(site.variants);
			const expanded = expandedSiteKeys.has(site.siteKey);
			const siteRow = buildSiteRow(site, progress, expanded);
			const opportunityRows = site.variants.map((variant) =>
				buildOpportunityRow(site, variant, this.submissionsByDestinationIdVm)
			);

			const siteMatches = filter(siteRow);
			const matchingOpportunities = opportunityRows.filter(filter);

			if (filterActive) {
				if (!siteMatches && matchingOpportunities.length === 0) continue;
				rows.push(siteRow);
				for (const opportunity of matchingOpportunities) {
					rows.push({ ...opportunity, isSiteExpanded: true });
				}
				continue;
			}

			rows.push(siteRow);
			if (!expanded) continue;
			for (const opportunity of opportunityRows) {
				rows.push({ ...opportunity, isSiteExpanded: true });
			}
		}

		return rows;
	}

	getGridColumnsForHostWidth(hostWidthPx: number): IColumn[] {
		const actionsWidth = actionsColumnWidthForHost(hostWidthPx);
		const fixed =
			DOFOLLOW_COL_WIDTH +
			AUTH_EMAIL_COL_WIDTH +
			READINESS_COL_WIDTH +
			SUBMISSION_COL_WIDTH +
			actionsWidth +
			GRID_WIDTH_GUTTER;

		if (hostWidthPx <= 0) {
			return buildGridColumns(DIRECTORY_MIN_WIDTH, LIST_URL_MIN_WIDTH, actionsWidth);
		}

		const remaining = Math.max(DIRECTORY_MIN_WIDTH + LIST_URL_MIN_WIDTH, hostWidthPx - fixed);
		const directoryWidth = Math.max(
			DIRECTORY_MIN_WIDTH,
			Math.min(Math.floor(remaining * DIRECTORY_FLEX_SHARE), remaining - LIST_URL_MIN_WIDTH)
		);
		const listUrlWidth = Math.max(LIST_URL_MIN_WIDTH, remaining - directoryWidth);
		return buildGridColumns(directoryWidth, listUrlWidth, actionsWidth);
	}

	getGridSizes(): { rowHeight: number; headerHeight: number } {
		return { rowHeight: 44, headerHeight: 40 };
	}
}
