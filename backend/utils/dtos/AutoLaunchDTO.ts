import {
    profileSimilarityPercentToMain,
    type BusinessProfileData,
    type ProfileLaunchMissingField,
} from "openquok-common";

import { parseSubmissionListingEvidence } from "../../services/autoLaunch/submissionListingEvidence";
import { resolveAutoLaunchProfileImageUrl } from "../images/autoLaunchProfileMediaImages";
import type {
    AutoLaunchDestinationListRow,
    AutoLaunchDestinationRow,
    AutoLaunchExtensionConfig,
    AutoLaunchProductProfileKind,
    AutoLaunchProductProfileRow,
    AutoLaunchProfileSnapshot,
    AutoLaunchSubmissionRow,
    BusinessProfileListRow,
} from "../../data/types/autoLaunchTypes";

export type BusinessProfileDto = {
    integrationCustomerId: string | null;
    productProfileId: string | null;
    name: string;
    tagline: string | null;
    websiteUrl: string | null;
    logoUrl: string | null;
};

export type AutoLaunchProductProfileDto = {
    id: string;
    organizationId: string;
    integrationCustomerId: string | null;
    name: string;
    tagline: string | null;
    description: string | null;
    websiteUrl: string | null;
    logoUrl: string | null;
    profileData: BusinessProfileData;
    profileKind: AutoLaunchProductProfileKind;
    parentProfileId: string | null;
    directorySiteKey: string | null;
    similarityToMainPercent: number | null;
    createdAt: string;
    updatedAt: string;
};

export type AutoLaunchDestinationDto = {
    id: string;
    providerSlug: string;
    name: string;
    shortDescription: string | null;
    submissionPath: "extension" | "auto";
    startUrl: string;
    sortOrder: number;
    opportunityDescription: string | null;
    opportunityTitle: string | null;
    opportunityDofollow: "dofollow" | "nofollow" | "unknown" | null;
    opportunityCostTier: "free" | "freemium" | "paid" | null;
    opportunityCostNote: string | null;
    siteDomainRating: number | null;
    siteMetricsUpdatedAt: string | null;
    siteTitle: string | null;
    pickerGroupKey: string | null;
    pickerGroupTitle: string | null;
    /** Fill steps for extension autofill and profile readiness (published destinations only). */
    extensionConfig: AutoLaunchExtensionConfig;
};

export type AutoLaunchAdminDestinationDto = AutoLaunchDestinationDto & {
    linkDirectoryOpportunityId: string | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AutoLaunchSubmissionSyncStatus = "pending" | "synced" | "stale";

export type AutoLaunchSubmissionDto = {
    id: string;
    organizationId: string;
    productProfileId: string;
    destinationId: string;
    status: AutoLaunchSubmissionRow["status"];
    listingUrl: string | null;
    /** User-reported whether the live listing link is dofollow (defaults false when unset). */
    listingDofollow: boolean;
    authEmail: string | null;
    intentCreatedAt: string | null;
    completedAt: string | null;
    listingSyncedAt: string | null;
    syncStatus: AutoLaunchSubmissionSyncStatus;
    createdAt: string;
    updatedAt: string;
};

export type AutoLaunchSubmissionIntentDto = {
    submissionId: string;
    launchToken: string;
    startUrl: string;
    providerSlug: string;
    profileSnapshot: AutoLaunchProfileSnapshot;
    extensionConfig: AutoLaunchExtensionConfig;
    steps: AutoLaunchExtensionConfig["steps"];
};

export type AutoLaunchSubmissionCompleteDto = {
    submissionId: string;
    status: AutoLaunchSubmissionRow["status"];
    listingUrl: string | null;
    alreadyCompleted: boolean;
};

export type AutoLaunchProfileListingSummaryDestinationRow = {
    destinationId: string;
    providerSlug: string;
    destinationName: string;
    submissionStatus: "none" | "completed" | "other";
    syncStatus: AutoLaunchSubmissionSyncStatus | null;
    readiness: {
        isReady: boolean;
        missingFields: ProfileLaunchMissingField[];
    };
};

export type AutoLaunchProfileListingSummaryDto = {
    profileId: string;
    publishedDirectorySiteCount: number;
    submittedDirectorySiteCount: number;
    unsubmittedDirectorySiteCount: number;
    destinations: AutoLaunchProfileListingSummaryDestinationRow[];
};

function resolveSnapshotProfileData(profileData: BusinessProfileData): BusinessProfileData {
    const gallery = profileData.gallery_urls;
    if (!Array.isArray(gallery) || gallery.length === 0) {
        return profileData;
    }

    const gallery_urls = gallery.map((entry) => {
        if (typeof entry !== "string") return entry;
        return resolveAutoLaunchProfileImageUrl(entry) ?? entry;
    });

    return { ...profileData, gallery_urls };
}

export function buildProfileSnapshot(row: AutoLaunchProductProfileRow): AutoLaunchProfileSnapshot {
    const profileData = (row.profile_data ?? {}) as BusinessProfileData;
    return {
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        website_url: row.website_url,
        logo_url: resolveAutoLaunchProfileImageUrl(row.logo_url) ?? row.logo_url,
        profile_data: resolveSnapshotProfileData(profileData),
        integration_customer_id: row.integration_customer_id,
    };
}

export function toBusinessProfileDto(row: BusinessProfileListRow): BusinessProfileDto {
    return {
        integrationCustomerId: row.integration_customer_id,
        productProfileId: row.product_profile_id,
        name: row.name,
        tagline: row.tagline,
        websiteUrl: row.website_url,
        logoUrl: row.logo_url,
    };
}

export function toBusinessProfileDtoCollection(rows: BusinessProfileListRow[]): BusinessProfileDto[] {
    return (rows ?? []).map(toBusinessProfileDto);
}

function normalizeProfileKind(row: AutoLaunchProductProfileRow): AutoLaunchProductProfileKind {
    return row.profile_kind === "directory_variant" ? "directory_variant" : "main";
}

export function toAutoLaunchProductProfileDto(
    row: AutoLaunchProductProfileRow,
    options?: { similarityToMainPercent?: number | null }
): AutoLaunchProductProfileDto {
    const profileKind = normalizeProfileKind(row);
    return {
        id: row.id,
        organizationId: row.organization_id,
        integrationCustomerId: row.integration_customer_id,
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        websiteUrl: row.website_url,
        logoUrl: row.logo_url,
        profileData: row.profile_data ?? {},
        profileKind,
        parentProfileId: row.parent_profile_id ?? null,
        directorySiteKey: row.directory_site_key ?? null,
        similarityToMainPercent: options?.similarityToMainPercent ?? null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function computeSimilarityToMainPercent(
    variant: AutoLaunchProductProfileRow,
    main: AutoLaunchProductProfileRow | null
): number | null {
    if (normalizeProfileKind(variant) !== "directory_variant" || !main) {
        return null;
    }
    return profileSimilarityPercentToMain(buildProfileSnapshot(main), buildProfileSnapshot(variant));
}

export function toAutoLaunchProductProfileDtoCollection(
    rows: AutoLaunchProductProfileRow[],
    mainById?: Map<string, AutoLaunchProductProfileRow>
): AutoLaunchProductProfileDto[] {
    return (rows ?? []).map((row) => {
        const main =
            row.parent_profile_id && mainById
                ? mainById.get(row.parent_profile_id) ?? null
                : null;
        const similarity = computeSimilarityToMainPercent(row, main);
        return toAutoLaunchProductProfileDto(row, { similarityToMainPercent: similarity });
    });
}

function normalizeDofollow(
    value: string | null | undefined
): AutoLaunchDestinationDto["opportunityDofollow"] {
    if (value === "dofollow" || value === "nofollow" || value === "unknown") return value;
    return null;
}

function normalizeCostTier(
    value: string | null | undefined
): AutoLaunchDestinationDto["opportunityCostTier"] {
    if (value === "free" || value === "freemium" || value === "paid") return value;
    return null;
}

export function toAutoLaunchDestinationDto(row: AutoLaunchDestinationListRow): AutoLaunchDestinationDto {
    return {
        id: row.id,
        providerSlug: row.provider_slug,
        name: row.name,
        shortDescription: row.short_description,
        submissionPath: row.submission_path,
        startUrl: row.start_url,
        sortOrder: row.sort_order,
        opportunityDescription: row.opportunity_description ?? null,
        opportunityTitle: row.opportunity_title ?? null,
        opportunityDofollow: normalizeDofollow(row.opportunity_dofollow),
        opportunityCostTier: normalizeCostTier(row.opportunity_cost_tier),
        opportunityCostNote: row.opportunity_cost_note ?? null,
        siteDomainRating: row.site_domain_rating ?? null,
        siteMetricsUpdatedAt: row.site_metrics_updated_at ?? null,
        siteTitle: row.site_title ?? null,
        pickerGroupKey: row.picker_group_key ?? null,
        pickerGroupTitle: row.picker_group_title ?? null,
        extensionConfig: row.extension_config ?? {},
    };
}

export function toAutoLaunchDestinationDtoCollection(rows: AutoLaunchDestinationListRow[]): AutoLaunchDestinationDto[] {
    return (rows ?? []).map(toAutoLaunchDestinationDto);
}

export function toAutoLaunchAdminDestinationDto(row: AutoLaunchDestinationRow): AutoLaunchAdminDestinationDto {
    const list = toAutoLaunchDestinationDto(row as AutoLaunchDestinationListRow);
    return {
        ...list,
        linkDirectoryOpportunityId: row.link_directory_opportunity_id,
        extensionConfig: row.extension_config ?? {},
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function toAutoLaunchAdminDestinationDtoCollection(
    rows: AutoLaunchDestinationRow[]
): AutoLaunchAdminDestinationDto[] {
    return (rows ?? []).map(toAutoLaunchAdminDestinationDto);
}

export function toAutoLaunchSubmissionDto(
    row: AutoLaunchSubmissionRow,
    options?: { syncStatus?: AutoLaunchSubmissionSyncStatus }
): AutoLaunchSubmissionDto {
    const syncStatus =
        options?.syncStatus ??
        (row.status === "completed"
            ? row.listing_profile_fingerprint
                ? "synced"
                : "stale"
            : "pending");

    const listingEvidence = parseSubmissionListingEvidence(row.evidence);

    return {
        id: row.id,
        organizationId: row.organization_id,
        productProfileId: row.product_profile_id,
        destinationId: row.destination_id,
        status: row.status,
        listingUrl: row.listing_url,
        listingDofollow: listingEvidence.listingDofollow,
        authEmail: listingEvidence.authEmail,
        intentCreatedAt: row.intent_created_at,
        completedAt: row.completed_at,
        listingSyncedAt: row.listing_synced_at,
        syncStatus,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function toAutoLaunchSubmissionDtoCollection(
    rows: AutoLaunchSubmissionRow[],
    options?: {
        syncStatusBySubmissionId?: Map<string, AutoLaunchSubmissionSyncStatus>;
    }
): AutoLaunchSubmissionDto[] {
    const syncById = options?.syncStatusBySubmissionId;
    return (rows ?? []).map((row) =>
        toAutoLaunchSubmissionDto(row, syncById ? { syncStatus: syncById.get(row.id) } : undefined)
    );
}

export function toSubmissionIntentDto(params: {
    submissionId: string;
    launchToken: string;
    destination: AutoLaunchDestinationRow;
    profileSnapshot: AutoLaunchProfileSnapshot;
}): AutoLaunchSubmissionIntentDto {
    const extensionConfig = params.destination.extension_config ?? {};
    const steps = extensionConfig.steps ?? [];
    return {
        submissionId: params.submissionId,
        launchToken: params.launchToken,
        startUrl: params.destination.start_url,
        providerSlug: params.destination.provider_slug,
        profileSnapshot: params.profileSnapshot,
        extensionConfig,
        steps,
    };
}
