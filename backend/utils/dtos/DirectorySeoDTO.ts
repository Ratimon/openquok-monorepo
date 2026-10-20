import type { SeoDomainMetricHistoryRow, SeoDomainMetricSnapshotRow } from "../../data/types/directorySeoTypes";
import type { DirectorySeoCompetitorRow } from "../../data/types/directorySeoTypes";

export type DirectorySeoDomainMetricDto = {
    domain: string;
    domainRating: number | null;
    checkedAt: string | null;
    delta7Days: number | null;
    delta30Days: number | null;
    delta90Days: number | null;
};

export type DirectorySeoCompetitorDto = {
    domain: string;
    label: string | null;
    sortOrder: number;
    domainRating: number | null;
    checkedAt: string | null;
};

export type DirectorySeoWorkspaceOverviewDto = {
    productDomain: DirectorySeoDomainMetricDto | null;
    competitors: DirectorySeoCompetitorDto[];
    /** False when DATAFORSEO_API_KEY is not configured on the API. */
    providerConfigured: boolean;
    /** ISO timestamp when manual refresh is allowed again; null when refresh is allowed now. */
    manualRefreshAvailableAt: string | null;
};

export type DirectorySeoHistoryPointDto = {
    capturedAt: string;
    domainRating: number | null;
};

export type DirectorySeoCompetitorHistoryDto = {
    domain: string;
    label: string | null;
    points: DirectorySeoHistoryPointDto[];
};

export type DirectorySeoWorkspaceHistoryDto = {
    product: DirectorySeoHistoryPointDto[];
    competitors: DirectorySeoCompetitorHistoryDto[];
};

function toNumber(value: number | string | null | undefined): number | null {
    if (value == null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function computeDelta(
    current: number | null,
    historical: number | null
): number | null {
    if (current == null || historical == null) return null;
    return Math.round((current - historical) * 100) / 100;
}

export function toDirectorySeoDomainMetricDto(params: {
    domain: string;
    snapshot: SeoDomainMetricSnapshotRow | null;
    rating7DaysAgo: number | null;
    rating30DaysAgo: number | null;
    rating90DaysAgo: number | null;
}): DirectorySeoDomainMetricDto {
    const current = params.snapshot ? toNumber(params.snapshot.domain_rating) : null;
    return {
        domain: params.domain,
        domainRating: current,
        checkedAt: params.snapshot?.checked_at ?? null,
        delta7Days: computeDelta(current, params.rating7DaysAgo),
        delta30Days: computeDelta(current, params.rating30DaysAgo),
        delta90Days: computeDelta(current, params.rating90DaysAgo),
    };
}

export function toDirectorySeoCompetitorDto(
    row: DirectorySeoCompetitorRow,
    snapshot: SeoDomainMetricSnapshotRow | null
): DirectorySeoCompetitorDto {
    return {
        domain: row.domain,
        label: row.label,
        sortOrder: row.sort_order,
        domainRating: snapshot ? toNumber(snapshot.domain_rating) : null,
        checkedAt: snapshot?.checked_at ?? null,
    };
}

export function toDirectorySeoHistoryPointDto(
    row: SeoDomainMetricHistoryRow
): DirectorySeoHistoryPointDto {
    return {
        capturedAt: row.captured_at,
        domainRating: toNumber(row.domain_rating),
    };
}
