import { config } from "../../config/GlobalConfig";
import { InfraError } from "../../errors/InfraError";

const DATAFORSEO_BASE = "https://api.dataforseo.com";
const SUMMARY_PATH = "/v3/backlinks/summary/live";

export type BacklinksSummaryLiveResult = {
    domainRating: number | null;
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

/**
 * v1: POST /v3/backlinks/summary/live only (domain rating on rank_scale one_hundred).
 */
export async function fetchBacklinksSummaryLive(
    domain: string,
    fetchImpl: DataForSeoFetchFn = fetch
): Promise<BacklinksSummaryLiveResult> {
    const { apiKey, enabled } = dataforseoConfig();
    if (!enabled || !apiKey) {
        throw new InfraError("DataForSEO is not configured", {
            component: "dataforseo",
            operation: "fetchBacklinksSummaryLive",
            statusCode: 503,
        });
    }

    const payload = {
        target: domain,
        include_subdomains: true,
        include_indirect_links: true,
        exclude_internal_backlinks: true,
        backlinks_status_type: "live",
        rank_scale: "one_hundred",
    };

    const response = await fetchImpl(`${DATAFORSEO_BASE}${SUMMARY_PATH}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${apiKey}`,
        },
        body: JSON.stringify([payload]),
        signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
        throw new InfraError(`DataForSEO HTTP ${response.status} on ${SUMMARY_PATH}`, {
            component: "dataforseo",
            operation: "fetchBacklinksSummaryLive",
            statusCode: 502,
        });
    }

    const envelope = (await response.json()) as DataForSeoTaskEnvelope;
    const task = envelope.tasks?.[0];
    if (!task || (task.status_code !== 20000 && !isNoResultsTask(task))) {
        throw new InfraError(
            `DataForSEO task ${task?.status_code ?? "missing"} on ${SUMMARY_PATH}: ${task?.status_message ?? "no task"}`,
            {
                component: "dataforseo",
                operation: "fetchBacklinksSummaryLive",
                statusCode: 502,
            }
        );
    }

    const resultRow = task.result?.[0];
    const rank = resultRow?.rank;
    return { domainRating: parseDomainRating(rank) };
}
