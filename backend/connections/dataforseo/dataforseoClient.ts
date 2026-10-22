import { config } from "../../config/GlobalConfig";
import { InfraError } from "../../errors/InfraError";

const DATAFORSEO_BASE = "https://api.dataforseo.com";
const SUMMARY_PATH = "/v3/backlinks/summary/live";
const TIMESERIES_SUMMARY_PATH = "/v3/backlinks/timeseries_summary/live";

export type BacklinksSummaryLiveResult = {
    domainRating: number | null;
};

export type BacklinksTimeseriesGroupRange = "day" | "week" | "month";

export type BacklinksTimeseriesSummaryLivePoint = {
    capturedAt: string;
    domainRating: number;
};

export type BacklinksTimeseriesSummaryLiveResult = {
    points: BacklinksTimeseriesSummaryLivePoint[];
};

type DataForSeoTaskEnvelope = {
    tasks?: Array<{
        status_code?: number;
        status_message?: string;
        result?: Array<Record<string, unknown>> | null;
    }>;
};

export type DataForSeoFetchFn = typeof fetch;

function dataforseoConfig(): { apiKey: string; enabled: boolean } {
    const dfs = config.dataforseo as { apiKey?: string } | undefined;
    const directorySeo = config.directorySeo as { enabled?: boolean } | undefined;
    return {
        apiKey: dfs?.apiKey?.trim() ?? "",
        enabled: directorySeo?.enabled ?? false,
    };
}

export function isDataForSeoConfigured(): boolean {
    const { apiKey, enabled } = dataforseoConfig();
    return enabled && apiKey.length > 0;
}

function isNoResultsTask(task: { status_message?: string } | undefined): boolean {
    return task?.status_message?.toLowerCase().includes("no search results") ?? false;
}

function parseDomainRating(raw: unknown): number | null {
    if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
    return raw;
}

function assertDataForSeoConfigured(operation: string): string {
    const { apiKey, enabled } = dataforseoConfig();
    if (!enabled || !apiKey) {
        throw new InfraError("DataForSEO is not configured", {
            component: "dataforseo",
            operation,
            statusCode: 503,
        });
    }
    return apiKey;
}

function parseTaskResultRows(
    envelope: DataForSeoTaskEnvelope,
    path: string,
    operation: string
): Array<Record<string, unknown>> | null {
    const task = envelope.tasks?.[0];
    if (!task || (task.status_code !== 20000 && !isNoResultsTask(task))) {
        throw new InfraError(
            `DataForSEO task ${task?.status_code ?? "missing"} on ${path}: ${task?.status_message ?? "no task"}`,
            {
                component: "dataforseo",
                operation,
                statusCode: 502,
            }
        );
    }
    return task.result ?? null;
}

/**
 * POST a single-task live payload to DataForSEO and return parsed result rows (or null for no results).
 */
export async function postDataForSeoLiveTask(
    path: string,
    payload: Record<string, unknown>,
    operation: string,
    fetchImpl: DataForSeoFetchFn = fetch
): Promise<Array<Record<string, unknown>> | null> {
    const apiKey = assertDataForSeoConfigured(operation);

    const response = await fetchImpl(`${DATAFORSEO_BASE}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${apiKey}`,
        },
        body: JSON.stringify([payload]),
        signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
        throw new InfraError(`DataForSEO HTTP ${response.status} on ${path}`, {
            component: "dataforseo",
            operation,
            statusCode: 502,
        });
    }

    const envelope = (await response.json()) as DataForSeoTaskEnvelope;
    return parseTaskResultRows(envelope, path, operation);
}

function itemDateToCapturedAtIso(raw: unknown): string | null {
    if (typeof raw !== "string" || !raw.trim()) return null;
    const trimmed = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return `${trimmed}T00:00:00.000Z`;
    }
    const parsed = Date.parse(trimmed);
    if (!Number.isFinite(parsed)) return null;
    return new Date(parsed).toISOString();
}

function parseTimeseriesItems(resultRows: Array<Record<string, unknown>> | null): BacklinksTimeseriesSummaryLivePoint[] {
    if (!resultRows?.length) return [];
    const resultRow = resultRows[0];
    const items = resultRow.items;
    if (!Array.isArray(items)) return [];

    const points: BacklinksTimeseriesSummaryLivePoint[] = [];
    for (const item of items) {
        if (!item || typeof item !== "object") continue;
        const record = item as Record<string, unknown>;
        const rating = parseDomainRating(record.rank);
        if (rating === null || rating === 0) continue;
        const capturedAt = itemDateToCapturedAtIso(record.date);
        if (!capturedAt) continue;
        points.push({ capturedAt, domainRating: rating });
    }
    return points;
}

/**
 * POST /v3/backlinks/summary/live (domain rating on rank_scale one_hundred).
 */
export async function fetchBacklinksSummaryLive(
    domain: string,
    fetchImpl: DataForSeoFetchFn = fetch
): Promise<BacklinksSummaryLiveResult> {
    const payload = {
        target: domain,
        include_subdomains: true,
        include_indirect_links: true,
        exclude_internal_backlinks: true,
        backlinks_status_type: "live",
        rank_scale: "one_hundred",
    };

    const resultRows = await postDataForSeoLiveTask(
        SUMMARY_PATH,
        payload,
        "fetchBacklinksSummaryLive",
        fetchImpl
    );
    const resultRow = resultRows?.[0];
    const rank = resultRow?.rank;
    return { domainRating: parseDomainRating(rank) };
}

export type FetchBacklinksTimeseriesSummaryLiveOptions = {
    dateFrom: string;
    dateTo: string;
    groupRange: BacklinksTimeseriesGroupRange;
};

/**
 * POST /v3/backlinks/timeseries_summary/live — daily (or other) rank history on rank_scale one_hundred.
 */
export async function fetchBacklinksTimeseriesSummaryLive(
    domain: string,
    options: FetchBacklinksTimeseriesSummaryLiveOptions,
    fetchImpl: DataForSeoFetchFn = fetch
): Promise<BacklinksTimeseriesSummaryLiveResult> {
    const payload = {
        target: domain,
        date_from: options.dateFrom,
        date_to: options.dateTo,
        group_range: options.groupRange,
        include_subdomains: true,
        rank_scale: "one_hundred",
    };

    const resultRows = await postDataForSeoLiveTask(
        TIMESERIES_SUMMARY_PATH,
        payload,
        "fetchBacklinksTimeseriesSummaryLive",
        fetchImpl
    );
    return { points: parseTimeseriesItems(resultRows) };
}
