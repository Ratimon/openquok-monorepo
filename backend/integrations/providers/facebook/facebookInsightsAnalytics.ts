import type { AnalyticsData } from "../../social.integrations.interface";

import dayjs from "dayjs";

/** Insights-only Graph version (legacy impression metrics removed Jun 2026). */
export const FACEBOOK_INSIGHTS_GRAPH = "https://graph.facebook.com/v21.0";

export const FACEBOOK_PAGE_ANALYTICS_METRICS = [
    "page_total_media_view_unique",
    "page_media_view",
    "page_post_engagements",
    "page_daily_follows",
    "page_video_views",
].join(",");

export const FACEBOOK_POST_ANALYTICS_METRICS = [
    "post_total_media_view_unique",
    "post_reactions_by_type_total",
    "post_clicks",
    "post_clicks_by_type",
].join(",");

type GraphInsightRow = {
    name?: string;
    values?: Array<{ value?: number | Record<string, number>; end_time?: string }>;
};

type GraphInsightsResponse = {
    data?: GraphInsightRow[];
    error?: { message?: string };
};

export function facebookPageAnalyticsMetricLabel(metricName: string): string {
    switch (metricName) {
        case "page_total_media_view_unique":
            return "Page views";
        case "page_media_view":
            return "Content views";
        case "page_post_engagements":
            return "Posts Engagement";
        case "page_daily_follows":
            return "Page followers";
        case "page_video_views":
            return "Videos views";
        default:
            return metricName;
    }
}

export function mapFacebookPageInsightsResponse(json: GraphInsightsResponse): AnalyticsData[] {
    if (json.error) {
        throw new Error(json.error.message ?? "Facebook Page insights request failed");
    }
    const byMetric = new Map<string, AnalyticsData>();
    for (const d of json.data ?? []) {
        const metricName = d.name ?? "";
        if (!metricName || byMetric.has(metricName)) continue;
        byMetric.set(metricName, {
            label: facebookPageAnalyticsMetricLabel(metricName),
            percentageChange: 0,
            data: (d.values ?? []).map((v) => ({
                total: String(v.value ?? 0),
                date: dayjs(v.end_time).format("YYYY-MM-DD"),
            })),
        });
    }
    return [...byMetric.values()];
}

export function mapFacebookPostInsightsResponse(
    json: GraphInsightsResponse,
    today: string
): AnalyticsData[] {
    if (json.error) {
        throw new Error(json.error.message ?? "Facebook post insights request failed");
    }

    const byMetric = new Map<string, AnalyticsData>();
    for (const metric of json.data ?? []) {
        const metricName = metric.name ?? "";
        if (!metricName || byMetric.has(metricName)) continue;

        const value = metric.values?.[0]?.value;
        if (value === undefined) continue;

        let label = "";
        let total = "";

        switch (metricName) {
            case "post_total_media_view_unique":
                label = "Views";
                total = String(value);
                break;
            case "post_clicks":
                label = "Clicks";
                total = String(value);
                break;
            case "post_clicks_by_type":
                if (typeof value === "object") {
                    label = "Clicks by Type";
                    total = String(Object.values(value).reduce((sum, v) => sum + Number(v), 0));
                }
                break;
            case "post_reactions_by_type_total":
                if (typeof value === "object") {
                    label = "Reactions";
                    total = String(Object.values(value).reduce((sum, v) => sum + Number(v), 0));
                }
                break;
        }

        if (label) {
            byMetric.set(metricName, { label, percentageChange: 0, data: [{ total, date: today }] });
        }
    }
    return dedupeAnalyticsDataByLabel([...byMetric.values()]);
}

function dedupeAnalyticsDataByLabel(rows: AnalyticsData[]): AnalyticsData[] {
    const byLabel = new Map<string, AnalyticsData>();
    for (const row of rows) {
        const key = row.label.trim();
        if (!key || byLabel.has(key)) continue;
        byLabel.set(key, row);
    }
    return [...byLabel.values()];
}
