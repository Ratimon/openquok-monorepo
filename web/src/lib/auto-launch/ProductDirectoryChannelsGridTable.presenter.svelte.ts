import type { IColumn } from '@svar-ui/svelte-grid';
import type { DestinationLaunchReadiness } from 'openquok-common';
import { getDirectorySiteOpportunityProgress } from 'openquok-common';

import type { AutoLaunchDestinationDto, AutoLaunchSubmissionDto } from '$lib/auto-launch/auto-launch.types';
import type { DirectoryLaunchSiteSummaryRow } from '$lib/auto-launch/groupDirectoryLaunchSiteSummaryRows';
import {
	formatCatalogDomainRating,
	formatCatalogMetricsUpdatedAt,
	indexDestinationsByProviderSlug,
	indexDirectoryCatalogBySiteKey,
	type DirectorySiteCatalogSnapshot
} from '$lib/auto-launch/utils/directoryGridCatalogFields';
import { mergeOpportunityListingSubmission } from '$lib/auto-launch/mergeDirectorySiteListingSubmission';
import { resolveDirectoryLinkTypeDisplay } from '$lib/auto-launch/utils/resolveDirectoryLinkTypeDisplay';

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
	linkTypeDisplay: string;
	catalogDrDisplay: string;
	catalogDrUpdatedDisplay: string;
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
	hasDirectoryVariant: boolean;
	opportunityCount: number;
	siteProgressLabel: string;
	siteProgressFullyComplete: boolean;
	isSiteExpanded: boolean;
};

type DirectoryChannelsGridVis = {
	directoryWidth: number;
	listUrlWidth: number;
	actionsWidth: number;
	showListUrl: boolean;
	showReadiness: boolean;
	showAuthEmail: boolean;
	showDrUpdated: boolean;
};

const READINESS_COL_WIDTH = 132;
const STATUS_COL_WIDTH = 128;
const DR_COL_WIDTH = 56;
const DR_UPDATED_COL_WIDTH = 108;
const LINK_TYPE_COL_WIDTH = 96;
const AUTH_EMAIL_COL_WIDTH = 132;
const ACTIONS_COL_WIDTH_MIN = 200;
const ACTIONS_COL_WIDTH_MAX = 248;
const LIST_URL_MIN_WIDTH = 72;
const DIRECTORY_MIN_WIDTH = 148;
const DIRECTORY_FLEX_SHARE = 0.5;
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

function catalogDisplaysForSite(catalog: DirectorySiteCatalogSnapshot | undefined): {
	catalogDrDisplay: string;
	catalogDrUpdatedDisplay: string;
} {
	return {
		catalogDrDisplay: formatCatalogDomainRating(catalog?.siteDomainRating ?? null),
		catalogDrUpdatedDisplay: formatCatalogMetricsUpdatedAt(catalog?.siteMetricsUpdatedAt ?? null)
	};
}

function buildGridColumns(vis: DirectoryChannelsGridVis): IColumn[] {
	return [
		{
			id: 'siteLabel',
			header: 'Directory',
			width: vis.directoryWidth,
			cell: DirectoryChannelsGridDirectoryCell,
			tooltip: false
		},
		{
			id: 'listUrlDisplay',
			header: 'List URL',
			width: vis.listUrlWidth,
			hidden: !vis.showListUrl,
			cell: DirectoryChannelsGridListUrlCell,
			tooltip: false
		},
		{
			id: 'submissionDisplay',
			header: 'Status',
			width: STATUS_COL_WIDTH,
			cell: DirectoryChannelsGridStatusCell,
			tooltip: false
		},
		{
			id: 'catalogDrDisplay',
			header: 'DR',
			width: DR_COL_WIDTH,
			tooltip: false
		},
		{
			id: 'catalogDrUpdatedDisplay',
			header: 'DR updated',
			width: DR_UPDATED_COL_WIDTH,
			hidden: !vis.showDrUpdated,
			tooltip: false
		},
		{
			id: 'linkTypeDisplay',
			header: 'Link type',
			width: LINK_TYPE_COL_WIDTH,
			tooltip: false
		},
		{
			id: 'readinessDisplay',
			header: 'Readiness',
			width: READINESS_COL_WIDTH,
			hidden: !vis.showReadiness,
			cell: DirectoryChannelsGridReadinessCell,
			tooltip: false
		},
		{
			id: 'authEmailDisplay',
			header: 'Auth email',
			width: AUTH_EMAIL_COL_WIDTH,
			hidden: !vis.showAuthEmail,
			tooltip: false
		},
		{
			id: 'actions',
			header: 'Actions',
			width: vis.actionsWidth,
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

function gridVisForHostWidth(hostWidthPx: number): DirectoryChannelsGridVis {
	const actionsWidth = actionsColumnWidthForHost(hostWidthPx);
	const showListUrl = hostWidthPx <= 0 || hostWidthPx > 520;
	const showDrUpdated = hostWidthPx <= 0 || hostWidthPx > 880;
	const showReadiness = hostWidthPx <= 0 || hostWidthPx > 1024;
	const showAuthEmail = hostWidthPx <= 0 || hostWidthPx > 1180;

	const fixed =
		STATUS_COL_WIDTH +
		DR_COL_WIDTH +
		LINK_TYPE_COL_WIDTH +
		actionsWidth +
		GRID_WIDTH_GUTTER +
		(showDrUpdated ? DR_UPDATED_COL_WIDTH : 0) +
		(showReadiness ? READINESS_COL_WIDTH : 0) +
		(showAuthEmail ? AUTH_EMAIL_COL_WIDTH : 0) +
		(showListUrl ? LIST_URL_MIN_WIDTH : 0);

	if (hostWidthPx <= 0) {
		return {
			directoryWidth: DIRECTORY_MIN_WIDTH,
			listUrlWidth: LIST_URL_MIN_WIDTH,
			actionsWidth,
			showListUrl: true,
			showReadiness: true,
			showAuthEmail: true,
			showDrUpdated: true
		};
	}

	const remaining = Math.max(DIRECTORY_MIN_WIDTH, hostWidthPx - fixed);
	const directoryWidth = Math.max(
		DIRECTORY_MIN_WIDTH,
		Math.min(Math.floor(remaining * DIRECTORY_FLEX_SHARE), remaining)
	);
	const listUrlWidth = showListUrl
		? Math.max(LIST_URL_MIN_WIDTH, remaining - directoryWidth)
		: LIST_URL_MIN_WIDTH;

	return {
		directoryWidth,
		listUrlWidth,
		actionsWidth,
		showListUrl,
		showReadiness,
		showAuthEmail,
		showDrUpdated
	};
}

function buildOpportunityRow(
	site: DirectoryLaunchSiteSummaryRow,
	variant: DirectoryLaunchSiteSummaryRow['variants'][number],
	submissionsByDestinationId: ReadonlyMap<string, AutoLaunchSubmissionDto>,
	destinationsByProviderSlug: ReadonlyMap<string, AutoLaunchDestinationDto>,
	catalogBySiteKey: ReadonlyMap<string, DirectorySiteCatalogSnapshot>,
	hasDirectoryVariant: boolean
): ProductDirectoryChannelTableRowViewModel {
	const listing = mergeOpportunityListingSubmission(variant, submissionsByDestinationId);
	const destination = destinationsByProviderSlug.get(variant.providerSlug);
	const catalog = catalogDisplaysForSite(catalogBySiteKey.get(site.siteKey));
	const linkTypeDisplay = resolveDirectoryLinkTypeDisplay({
		submissionStatus: variant.submissionStatus,
		listingDofollow: listing.listingDofollow,
		opportunityDofollow: destination?.opportunityDofollow ?? null
	});
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
		listingDofollowDisplay: linkTypeDisplay,
		linkTypeDisplay,
		catalogDrDisplay: catalog.catalogDrDisplay,
		catalogDrUpdatedDisplay: catalog.catalogDrUpdatedDisplay,
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
		hasDirectoryVariant,
		opportunityCount: site.variants.length,
		siteProgressLabel: '',
		siteProgressFullyComplete: false,
		isSiteExpanded: false
	};
}

function buildSiteRow(
	site: DirectoryLaunchSiteSummaryRow,
	progress: ReturnType<typeof getDirectorySiteOpportunityProgress>,
	isExpanded: boolean,
	catalogBySiteKey: ReadonlyMap<string, DirectorySiteCatalogSnapshot>,
	hasDirectoryVariant: boolean
): ProductDirectoryChannelTableRowViewModel {
	const showRefill =
		site.submissionStatus === 'completed' && site.syncStatus === 'stale' && progress.isFullyComplete;
	const catalog = catalogDisplaysForSite(catalogBySiteKey.get(site.siteKey));

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
		linkTypeDisplay: EMPTY,
		catalogDrDisplay: catalog.catalogDrDisplay,
		catalogDrUpdatedDisplay: catalog.catalogDrUpdatedDisplay,
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
		hasDirectoryVariant,
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
	catalogBySiteKeyVm = $state<Map<string, DirectorySiteCatalogSnapshot>>(new Map());
	destinationsByProviderSlugVm = $state<Map<string, AutoLaunchDestinationDto>>(new Map());
	variantProfileIdsBySiteKeyVm = $state<Map<string, string>>(new Map());

	refreshRowsFromSiteRows(
		siteRows: readonly DirectoryLaunchSiteSummaryRow[],
		submissionsByDestinationId: ReadonlyMap<string, AutoLaunchSubmissionDto>
	): void {
		this.siteRowsVm = [...siteRows].sort((a, b) =>
			a.siteLabel.localeCompare(b.siteLabel, undefined, { sensitivity: 'base' })
		);
		this.submissionsByDestinationIdVm = new Map(submissionsByDestinationId);
	}

	refreshCatalogFromDestinations(destinations: readonly AutoLaunchDestinationDto[]): void {
		this.catalogBySiteKeyVm = indexDirectoryCatalogBySiteKey(destinations);
		this.destinationsByProviderSlugVm = indexDestinationsByProviderSlug(destinations);
	}

	setVariantProfileIdsBySiteKey(map: ReadonlyMap<string, string>): void {
		this.variantProfileIdsBySiteKeyVm = new Map(map);
	}

	buildAllOpportunityRows(): ProductDirectoryChannelTableRowViewModel[] {
		const rows: ProductDirectoryChannelTableRowViewModel[] = [];
		for (const site of this.siteRowsVm) {
			const hasVariant = this.variantProfileIdsBySiteKeyVm.has(site.siteKey);
			for (const variant of site.variants) {
				rows.push(
					buildOpportunityRow(
						site,
						variant,
						this.submissionsByDestinationIdVm,
						this.destinationsByProviderSlugVm,
						this.catalogBySiteKeyVm,
						hasVariant
					)
				);
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
			const hasVariant = this.variantProfileIdsBySiteKeyVm.has(site.siteKey);
			const siteRow = buildSiteRow(site, progress, expanded, this.catalogBySiteKeyVm, hasVariant);
			const opportunityRows = site.variants.map((variant) =>
				buildOpportunityRow(
					site,
					variant,
					this.submissionsByDestinationIdVm,
					this.destinationsByProviderSlugVm,
					this.catalogBySiteKeyVm,
					hasVariant
				)
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
		return buildGridColumns(gridVisForHostWidth(hostWidthPx));
	}

	getGridSizes(): { rowHeight: number; headerHeight: number } {
		return { rowHeight: 44, headerHeight: 40 };
	}
}
