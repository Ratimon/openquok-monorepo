import type { AnalyticsData } from "../../social.integrations.interface";

import dayjs from "dayjs";

import { parseBlueskyToken, type BlueskyStoredCredentials } from "./blueskyCredentials";

export const BSKY_APP_VIEW_SERVICE = "https://public.api.bsky.app";

const FEED_PAGE_LIMIT = 100;
const MAX_FEED_PAGES = 10;

export type BlueskyPostEngagementSnapshot = {
    indexedAt?: string;
    recordCreatedAt?: string;
    likeCount?: number;
    replyCount?: number;
    repostCount?: number;
    quoteCount?: number;
};

type PostMetricTotals = {
    likes: number;
    replies: number;
    reposts: number;
    quotes: number;
};

const METRIC_LABELS: Array<{ key: keyof PostMetricTotals; label: string }> = [
    { key: "likes", label: "Likes" },
    { key: "replies", label: "Replies" },
    { key: "reposts", label: "Reposts" },
    { key: "quotes", label: "Quotes" },
];

export type BlueskyAnalyticsAgent = {
    did?: string;
    login: (credentials: { identifier: string; password: string }) => Promise<unknown>;
    getPosts: (params: { uris: string[] }) => Promise<{ data: { posts?: BlueskyPostEngagementSnapshot[] } }>;
    app: {
        bsky: {
            feed: {
                getAuthorFeed: (params: {
                    actor: string;
                    limit: number;
                    cursor?: string;
                }) => Promise<{
                    data: {
                        feed?: Array<{ post?: BlueskyPostEngagementSnapshot }>;
                        cursor?: string;
                    };
                }>;
            };
        };
    };
};

function formatDateFromIso(iso: string | undefined): string {
    if (!iso) return dayjs().format("YYYY-MM-DD");
    return dayjs(iso).format("YYYY-MM-DD");
}

function postIndexedAt(post: BlueskyPostEngagementSnapshot): string | undefined {
    return post.indexedAt ?? post.recordCreatedAt;
}

function readPostMetrics(post: BlueskyPostEngagementSnapshot): PostMetricTotals {
    return {
        likes: post.likeCount ?? 0,
        replies: post.replyCount ?? 0,
        reposts: post.repostCount ?? 0,
        quotes: post.quoteCount ?? 0,
    };
}

export function mapBlueskyPostBucketsToAnalytics(
    buckets: Record<string, PostMetricTotals>
): AnalyticsData[] {
    const dates = Object.keys(buckets).sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
    if (dates.length === 0) return [];

    return METRIC_LABELS.map(({ key, label }) => ({
        label,
        percentageChange: 0,
        data: dates.map((date) => ({
            date,
            total: String(buckets[date]?.[key] ?? 0),
        })),
    }));
}

export function mapBlueskyPostViewToAnalytics(post: BlueskyPostEngagementSnapshot): AnalyticsData[] {
    const date = formatDateFromIso(postIndexedAt(post));
    const metrics = readPostMetrics(post);
    return METRIC_LABELS.map(({ key, label }) => ({
        label,
        percentageChange: 0,
        data: [{ total: String(metrics[key]), date }],
    }));
}

async function loginBlueskyAgentForCredentials(
    credentials: BlueskyStoredCredentials,
    createAgent: (service: string) => BlueskyAnalyticsAgent
): Promise<BlueskyAnalyticsAgent> {
    const agent = createAgent(credentials.service);
    await agent.login({
        identifier: credentials.identifier,
        password: credentials.password,
    });
    return agent;
}

async function resolveActorDid(
    actorId: string,
    accessToken: string,
    createAgent: (service: string) => BlueskyAnalyticsAgent
): Promise<string> {
    const trimmed = actorId.trim();
    if (trimmed.startsWith("did:")) {
        return trimmed;
    }
    if (trimmed) {
        return trimmed;
    }
    const credentials = parseBlueskyToken(accessToken);
    const agent = await loginBlueskyAgentForCredentials(credentials, createAgent);
    const did = agent.did?.trim();
    if (!did) {
        throw new Error("Bluesky account id is required for analytics");
    }
    return did;
}

/** Account timeline aggregation from the public App View author feed. */
export async function fetchBlueskyAccountAnalytics(
    actorId: string,
    accessToken: string,
    dateWindowDays: number,
    deps: { createAgent: (service: string) => BlueskyAnalyticsAgent }
): Promise<AnalyticsData[]> {
    const actor = await resolveActorDid(actorId, accessToken, deps.createAgent);
    const days = Number.isFinite(dateWindowDays) && dateWindowDays > 0 ? Math.floor(dateWindowDays) : 7;
    const since = dayjs().subtract(days, "day").startOf("day");

    const agent = deps.createAgent(BSKY_APP_VIEW_SERVICE);

    const buckets: Record<string, PostMetricTotals> = {};
    let cursor: string | undefined;

    for (let page = 0; page < MAX_FEED_PAGES; page++) {
        const res = await agent.app.bsky.feed.getAuthorFeed({
            actor,
            limit: FEED_PAGE_LIMIT,
            cursor,
        });
        const feed = res.data.feed ?? [];
        if (feed.length === 0) break;

        let stopPaging = false;
        for (const item of feed) {
            const post = item.post;
            if (!post) continue;
            const indexedAt = postIndexedAt(post);
            const at = indexedAt ? dayjs(indexedAt) : null;
            if (at && at.isBefore(since)) {
                stopPaging = true;
                continue;
            }
            if (!at || at.isAfter(dayjs().endOf("day"))) continue;

            const date = formatDateFromIso(indexedAt);
            const metrics = readPostMetrics(post);
            const bucket = buckets[date] ?? { likes: 0, replies: 0, reposts: 0, quotes: 0 };
            bucket.likes += metrics.likes;
            bucket.replies += metrics.replies;
            bucket.reposts += metrics.reposts;
            bucket.quotes += metrics.quotes;
            buckets[date] = bucket;
        }

        cursor = res.data.cursor;
        if (!cursor || stopPaging) break;
    }

    return mapBlueskyPostBucketsToAnalytics(buckets);
}

/** Per-post public engagement via App View `getPosts`. */
export async function fetchBlueskyPostAnalytics(
    releaseId: string,
    deps: { createAgent: (service: string) => BlueskyAnalyticsAgent }
): Promise<AnalyticsData[]> {
    const uri = releaseId.trim();
    if (!uri.includes("://")) {
        throw new Error("Missing Bluesky post URI for post analytics");
    }

    const agent = deps.createAgent(BSKY_APP_VIEW_SERVICE);
    const res = await agent.getPosts({ uris: [uri] });
    const post = res.data.posts?.[0];
    if (!post) return [];
    return mapBlueskyPostViewToAnalytics(post);
}
