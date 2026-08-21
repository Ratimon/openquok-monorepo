import type { AnalyticsData } from "../../social.integrations.interface";

import dayjs from "dayjs";
import { ProviderAccessTokenExpiredError } from "../../../errors/ProviderIntegrationErrors";
import { DEVTO_API_BASE, devtoHeaders, mapDevtoApiError } from "./devtoPublish";

const METRIC_LABELS = {
    page_views: "Page Views",
    reactions: "Reactions",
    comments: "Comments",
} as const;

type DevtoMetricKey = keyof typeof METRIC_LABELS;

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJson(res: Response): Promise<unknown> {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

function throwIfUnauthorized(status: number, json: unknown): void {
    if (status === 401 || status === 403) {
        throw new ProviderAccessTokenExpiredError(mapDevtoApiError(json, status));
    }
}

function metricTotal(bucket: unknown): number {
    if (!isPlainObject(bucket)) return 0;
    const raw = bucket.total;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    const parsed = Number.parseInt(String(raw ?? ""), 10);
    return Number.isFinite(parsed) ? parsed : 0;
}

function dayMetricTotal(day: unknown, key: DevtoMetricKey): number {
    if (!isPlainObject(day)) return 0;
    return metricTotal(day[key]);
}

export function startDateForWindow(dateWindowDays: number): string {
    const days = Number.isFinite(dateWindowDays) && dateWindowDays > 0 ? Math.floor(dateWindowDays) : 7;
    return dayjs().subtract(days, "day").format("YYYY-MM-DD");
}

/** Map Forem `historical` date-keyed buckets into OpenQuok chart rows. */
export function mapDevtoHistoricalToAnalytics(json: unknown): AnalyticsData[] {
    if (!isPlainObject(json)) return [];

    const dates = Object.keys(json)
        .filter((key) => /^\d{4}-\d{1,2}-\d{1,2}$/.test(key))
        .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());

    if (dates.length === 0) return [];

    const series: Record<DevtoMetricKey, Array<{ total: string; date: string }>> = {
        page_views: [],
        reactions: [],
        comments: [],
    };

    for (const date of dates) {
        const day = json[date];
        const normalizedDate = dayjs(date).format("YYYY-MM-DD");
        for (const key of Object.keys(METRIC_LABELS) as DevtoMetricKey[]) {
            series[key].push({
                total: String(dayMetricTotal(day, key)),
                date: normalizedDate,
            });
        }
    }

    return (Object.keys(METRIC_LABELS) as DevtoMetricKey[]).map((key) => ({
        label: METRIC_LABELS[key],
        percentageChange: 0,
        data: series[key],
    }));
}

/** Map Forem `totals` aggregate into single-day OpenQuok chart rows. */
export function mapDevtoTotalsToAnalytics(json: unknown, date = dayjs().format("YYYY-MM-DD")): AnalyticsData[] {
    if (!isPlainObject(json)) return [];
    const hasAnyMetric = (Object.keys(METRIC_LABELS) as DevtoMetricKey[]).some((key) => key in json);
    if (!hasAnyMetric) return [];

    return (Object.keys(METRIC_LABELS) as DevtoMetricKey[]).map((key) => ({
        label: METRIC_LABELS[key],
        percentageChange: 0,
        data: [{ total: String(dayMetricTotal(json, key)), date }],
    }));
}

async function fetchDevtoJson(apiKey: string, pathWithQuery: string): Promise<unknown> {
    const res = await fetch(`${DEVTO_API_BASE}${pathWithQuery}`, {
        headers: devtoHeaders(apiKey),
    });
    const json = await readJson(res);
    throwIfUnauthorized(res.status, json);
    if (!res.ok) {
        throw new Error(mapDevtoApiError(json, res.status));
    }
    return json;
}

export async function fetchDevtoAccountAnalytics(
    apiKey: string,
    dateWindowDays: number
): Promise<AnalyticsData[]> {
    const start = startDateForWindow(dateWindowDays);
    const json = await fetchDevtoJson(
        apiKey,
        `/analytics/historical?start=${encodeURIComponent(start)}`
    );
    return mapDevtoHistoricalToAnalytics(json);
}

export async function fetchDevtoPostAnalytics(
    apiKey: string,
    articleId: string,
    dateWindowDays: number
): Promise<AnalyticsData[]> {
    const trimmed = articleId.trim();
    if (!trimmed) {
        throw new Error("Missing Dev.to article id for post analytics");
    }
    const articleQuery = `article_id=${encodeURIComponent(trimmed)}`;
    const start = startDateForWindow(dateWindowDays);

    const [historicalJson, totalsJson] = await Promise.all([
        fetchDevtoJson(
            apiKey,
            `/analytics/historical?start=${encodeURIComponent(start)}&${articleQuery}`
        ),
        fetchDevtoJson(apiKey, `/analytics/totals?${articleQuery}`),
    ]);

    const fromHistorical = mapDevtoHistoricalToAnalytics(historicalJson);
    if (fromHistorical.some((row) => row.data.length > 0)) {
        return fromHistorical;
    }
    return mapDevtoTotalsToAnalytics(totalsJson);
}
