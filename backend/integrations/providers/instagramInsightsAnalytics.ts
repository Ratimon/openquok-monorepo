/**
 * Instagram professional account / media insights (Graph API).
 * Shared by Instagram (Business via Facebook Login) and Instagram (Standalone).
 *
 */
import type { AnalyticsData } from "../social.integrations.interface";

import dayjs from "dayjs";

/** e.g. `https://graph.facebook.com/v21.0` or `https://graph.instagram.com/v21.0` */
export type InstagramGraphInsightsBaseUrl = string;

function metricTitle(name: string): string {
    switch (name) {
        case "likes":
            return "Likes";
        case "followers":
            return "Followers";
        case "reach":
            return "Reach";
        case "follower_count":
            return "Follower Count";
        case "views":
            return "Views";
        case "comments":
            return "Comments";
        case "shares":
            return "Shares";
        case "saves":
            return "Saves";
        case "replies":
            return "Replies";
        case "saved":
            return "Saves";
        case "engagement":
            return "Engagement";
        default:
            return name;
    }
}

/** Account-level insights for the analytics dashboard (time series + totals). */
export async function fetchInstagramAccountInsights(
    graphBaseUrl: InstagramGraphInsightsBaseUrl,
    igUserId: string,
    accessToken: string,
    dateWindowDays: number
): Promise<AnalyticsData[]> {
    const until = dayjs().endOf("day").unix();
    const since = dayjs().subtract(dateWindowDays, "day").unix();

    const enc = encodeURIComponent(accessToken);

    const res1 = await fetch(
        `${graphBaseUrl}/${encodeURIComponent(igUserId)}/insights?metric=follower_count,reach&access_token=${enc}&period=day&since=${since}&until=${until}`
    );
    const json1 = (await res1.json()) as {
        data?: Array<{ name?: string; values?: Array<{ value?: number; end_time?: string }> }>;
        error?: { message?: string };
    };
    if (!res1.ok || json1.error) {
        return [];
    }

    const res2 = await fetch(
        `${graphBaseUrl}/${encodeURIComponent(igUserId)}/insights?metric_type=total_value&metric=likes,views,comments,shares,saves,replies&access_token=${enc}&period=day&since=${since}&until=${until}`
    );
    const json2 = (await res2.json()) as {
        data?: Array<{ name?: string; total_value?: { value?: number }; values?: Array<{ value?: number; end_time?: string }> }>;
        error?: { message?: string };
    };
    if (!res2.ok || json2.error) {
        return [];
    }

    const today = dayjs().format("YYYY-MM-DD");
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

    const analytics: AnalyticsData[] = [];

    for (const d of json1.data ?? []) {
        const name = d.name ?? "";
        const label = metricTitle(name);
        if (!label) continue;
        analytics.push({
            label,
            percentageChange: 0,
            data: (d.values ?? []).map((v) => ({
                total: String(v.value ?? 0),
                date: v.end_time ? dayjs(v.end_time).format("YYYY-MM-DD") : today,
            })),
        });
    }

    for (const d of json2.data ?? []) {
        const name = d.name ?? "";
        const label = metricTitle(name);
        if (!label) continue;
        const raw = d.total_value?.value;
        const totalStr = raw != null ? String(raw) : "0";
        analytics.push({
            label,
            percentageChange: 0,
            data: [
                { total: totalStr, date: today },
                { total: totalStr, date: tomorrow },
            ],
        });
    }

    return analytics;
}

/** Single-post / media insights (Statistics modal parity). */
export async function fetchInstagramMediaInsights(
    graphBaseUrl: InstagramGraphInsightsBaseUrl,
    mediaId: string,
    accessToken: string
): Promise<AnalyticsData[]> {
    const today = dayjs().format("YYYY-MM-DD");
    const enc = encodeURIComponent(accessToken);

    const res = await fetch(
        `${graphBaseUrl}/${encodeURIComponent(mediaId)}/insights?metric=views,reach,saved,likes,comments,shares&access_token=${enc}`
    );
    const json = (await res.json()) as {
        data?: Array<{ name?: string; values?: Array<{ value?: number }> }>;
        error?: { message?: string };
    };
    if (!res.ok || json.error || !json.data?.length) {
        return [];
    }

    const result: AnalyticsData[] = [];
    for (const metric of json.data) {
        const value = metric.values?.[0]?.value;
        if (value === undefined) continue;
        const label = metricTitle(metric.name ?? "");
        if (!label) continue;
        result.push({
            label,
            percentageChange: 0,
            data: [{ total: String(value), date: today }],
        });
    }
    return result;
}
