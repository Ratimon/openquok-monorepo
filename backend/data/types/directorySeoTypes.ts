export type SeoDomainMetricHistoryOrigin = "live_refresh" | "provider_timeseries";

export type SeoDomainMetricSnapshotRow = {
    domain: string;
    domain_rating: number | null;
    source: string;
    checked_at: string;
    provider_history_backfilled_at: string | null;
};

export type SeoDomainMetricHistoryRow = {
    id: string;
    domain: string;
    domain_rating: number | null;
    captured_at: string;
    origin: SeoDomainMetricHistoryOrigin;
};

export type DirectorySeoCompetitorRow = {
    organization_id: string;
    domain: string;
    label: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
};
