import type { AnalyticsData } from "../../social.integrations.interface";

import dayjs from "dayjs";

import { config } from "../../../config/GlobalConfig";
import type { TwitterApi } from "twitter-api-v2";

function xAnalyticsDisabled(): boolean {
    return (config.integrations as { x?: { disableAnalytics?: boolean } }).x?.disableAnalytics === true;
}

function formatDateFromIso(iso: string | undefined): string {
    if (!iso) return dayjs().format("YYYY-MM-DD");
    return dayjs(iso).format("YYYY-MM-DD");
}

/** Account timeline aggregation for the analytics dashboard. */
export async function fetchXAccountAnalytics(
    client: TwitterApi,
    userId: string,
    dateWindowDays: number
): Promise<AnalyticsData[]> {
    if (xAnalyticsDisabled()) return [];

    const since = dayjs().subtract(dateWindowDays, "day").toISOString();
    const timeline = await client.v2.userTimeline(userId, {
        max_results: 100,
        start_time: since,
        "tweet.fields": ["public_metrics", "created_at"],
        exclude: ["retweets", "replies"],
    });

    const buckets: Record<string, Record<string, number>> = {};

    for await (const tweet of timeline) {
        const date = formatDateFromIso(tweet.created_at);
        const metrics = tweet.public_metrics;
        if (!metrics) continue;

        buckets[date] ??= {
            Likes: 0,
            Replies: 0,
            Reposts: 0,
            Quotes: 0,
            Impressions: 0,
        };

        buckets[date].Likes += metrics.like_count ?? 0;
        buckets[date].Replies += metrics.reply_count ?? 0;
        buckets[date].Reposts += metrics.retweet_count ?? 0;
        buckets[date].Quotes += metrics.quote_count ?? 0;
        buckets[date].Impressions += metrics.impression_count ?? 0;
    }

    const labels = ["Likes", "Replies", "Reposts", "Quotes", "Impressions"];
    return labels
        .map((label) => ({
            label,
            percentageChange: 0,
            data: Object.entries(buckets).map(([date, totals]) => ({
                date,
                total: String(totals[label] ?? 0),
            })),
        }))
        .filter((row) => row.data.length > 0);
}

/** Per-post public metrics for a published tweet (`releaseId`). */
export async function fetchXPostAnalytics(client: TwitterApi, releaseId: string): Promise<AnalyticsData[]> {
    if (xAnalyticsDisabled()) return [];

    const tweet = await client.v2.singleTweet(releaseId, {
        "tweet.fields": ["public_metrics", "created_at"],
    });

    const metrics = tweet.data.public_metrics;
    if (!metrics) return [];

    const date = formatDateFromIso(tweet.data.created_at);
    const rows: AnalyticsData[] = [
        { label: "Likes", data: [{ total: String(metrics.like_count ?? 0), date }], percentageChange: 0 },
        { label: "Replies", data: [{ total: String(metrics.reply_count ?? 0), date }], percentageChange: 0 },
        { label: "Reposts", data: [{ total: String(metrics.retweet_count ?? 0), date }], percentageChange: 0 },
        { label: "Quotes", data: [{ total: String(metrics.quote_count ?? 0), date }], percentageChange: 0 },
    ];

    if (typeof metrics.impression_count === "number") {
        rows.push({
            label: "Impressions",
            data: [{ total: String(metrics.impression_count), date }],
            percentageChange: 0,
        });
    }

    return rows;
}

export async function fetchXTweetLikeCount(client: TwitterApi, tweetId: string): Promise<number> {
    const tweet = await client.v2.singleTweet(tweetId, { "tweet.fields": ["public_metrics"] });
    return tweet.data.public_metrics?.like_count ?? 0;
}
