import type { AnalyticsData } from "../../social.integrations.interface";

import dayjs from "dayjs";
import { linkedinRestHeaders } from "./linkedinCommon";

type TimeRange = { start: number; end: number };

type PageStatElement = {
    timeRange?: TimeRange;
    totalPageStatistics?: {
        views?: { allPageViews?: { pageViews?: number } };
    };
    followerGains?: { organicFollowerGain?: number; paidFollowerGain?: number };
    totalShareStatistics?: {
        clickCount?: number;
        shareCount?: number;
        engagement?: number;
        commentCount?: number;
        impressionCount?: number;
        uniqueImpressionsCount?: number;
        likeCount?: number;
    };
};

type PostShareStatElement = {
    timeRange?: TimeRange;
    totalShareStatistics?: PageStatElement["totalShareStatistics"];
};

type SocialActionsResponse = {
    likesSummary?: { totalLikes?: number };
    commentsSummary?: { totalFirstLevelComments?: number };
};

function formatStatDate(ms: number | undefined): string {
    return dayjs(ms ?? Date.now()).format("YYYY-MM-DD");
}

/** Company page account analytics (`linkedin-page` only). */
export async function fetchLinkedInPageAnalytics(
    organizationId: string,
    accessToken: string,
    dateWindowDays: number
): Promise<AnalyticsData[]> {
    const endDate = dayjs().unix() * 1000;
    const startDate = dayjs().subtract(dateWindowDays, "day").unix() * 1000;
    const orgUrn = encodeURIComponent(`urn:li:organization:${organizationId}`);
    const interval = `(timeRange:(start:${startDate},end:${endDate}),timeGranularityType:DAY)`;
    const headers = linkedinRestHeaders(accessToken);

    const [pageStats, followerStats, shareStats] = await Promise.all([
        fetch(
            `https://api.linkedin.com/v2/organizationPageStatistics?q=organization&organization=${orgUrn}&timeIntervals=${interval}`,
            { headers }
        ).then((r) => r.json() as Promise<{ elements?: PageStatElement[] }>),
        fetch(
            `https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=${orgUrn}&timeIntervals=${interval}`,
            { headers }
        ).then((r) => r.json() as Promise<{ elements?: PageStatElement[] }>),
        fetch(
            `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${orgUrn}&timeIntervals=${interval}`,
            { headers }
        ).then((r) => r.json() as Promise<{ elements?: PageStatElement[] }>),
    ]);

    const analytics: Record<string, Array<{ total: string; date: string }>> = {
        "Page Views": [],
        Clicks: [],
        Shares: [],
        Engagement: [],
        Comments: [],
        "Organic Followers": [],
        "Paid Followers": [],
    };

    for (const current of [...(followerStats.elements ?? []), ...(pageStats.elements ?? []), ...(shareStats.elements ?? [])]) {
        const date = formatStatDate(current.timeRange?.start);
        const pageViews = current.totalPageStatistics?.views?.allPageViews?.pageViews;
        if (typeof pageViews !== "undefined") {
            analytics["Page Views"].push({ total: String(pageViews), date });
        }
        if (typeof current.followerGains?.organicFollowerGain !== "undefined") {
            analytics["Organic Followers"].push({
                total: String(current.followerGains.organicFollowerGain),
                date,
            });
        }
        if (typeof current.followerGains?.paidFollowerGain !== "undefined") {
            analytics["Paid Followers"].push({
                total: String(current.followerGains.paidFollowerGain),
                date,
            });
        }
        if (current.totalShareStatistics) {
            const s = current.totalShareStatistics;
            analytics.Clicks.push({ total: String(s.clickCount ?? 0), date });
            analytics.Shares.push({ total: String(s.shareCount ?? 0), date });
            analytics.Engagement.push({ total: String(s.engagement ?? 0), date });
            analytics.Comments.push({ total: String(s.commentCount ?? 0), date });
        }
    }

    return Object.entries(analytics)
        .filter(([, data]) => data.length > 0)
        .map(([label, data]) => ({
            label,
            data,
            percentageChange: 0,
        }));
}

/** Per-post share statistics for a published LinkedIn Page post (`releaseId`). */
export async function fetchLinkedInPostAnalytics(
    organizationId: string,
    accessToken: string,
    releaseId: string,
    dateWindowDays: number
): Promise<AnalyticsData[]> {
    const endDate = dayjs().unix() * 1000;
    const startDate = dayjs().subtract(dateWindowDays, "day").unix() * 1000;
    const orgUrn = encodeURIComponent(`urn:li:organization:${organizationId}`);
    const interval = `(timeRange:(start:${startDate},end:${endDate}),timeGranularityType:DAY)`;
    const headers = linkedinRestHeaders(accessToken);

    const shareStatsUrl =
        `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity` +
        `&organizationalEntity=${orgUrn}` +
        `&shares=List(${encodeURIComponent(releaseId)})` +
        `&timeIntervals=${interval}`;

    const { elements: shareElements } = (await fetch(shareStatsUrl, { headers }).then((r) =>
        r.json()
    )) as { elements?: PostShareStatElement[] };

    let socialActions: SocialActionsResponse | null = null;
    try {
        socialActions = (await fetch(
            `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(releaseId)}`,
            { headers }
        ).then((r) => r.json())) as SocialActionsResponse;
    } catch {
        socialActions = null;
    }

    const analytics: Record<string, Array<{ total: string; date: string }>> = {
        Impressions: [],
        "Unique Impressions": [],
        Clicks: [],
        Likes: [],
        Comments: [],
        Shares: [],
        Engagement: [],
    };

    for (const current of shareElements ?? []) {
        if (!current.totalShareStatistics) continue;
        const date = formatStatDate(current.timeRange?.start);
        const s = current.totalShareStatistics;
        analytics.Impressions.push({ total: String(s.impressionCount ?? 0), date });
        analytics["Unique Impressions"].push({ total: String(s.uniqueImpressionsCount ?? 0), date });
        analytics.Clicks.push({ total: String(s.clickCount ?? 0), date });
        analytics.Likes.push({ total: String(s.likeCount ?? 0), date });
        analytics.Comments.push({ total: String(s.commentCount ?? 0), date });
        analytics.Shares.push({ total: String(s.shareCount ?? 0), date });
        analytics.Engagement.push({ total: String(s.engagement ?? 0), date });
    }

    if (Object.values(analytics).every((arr) => arr.length === 0) && socialActions) {
        const today = dayjs().format("YYYY-MM-DD");
        analytics.Likes.push({ total: String(socialActions.likesSummary?.totalLikes ?? 0), date: today });
        analytics.Comments.push({
            total: String(socialActions.commentsSummary?.totalFirstLevelComments ?? 0),
            date: today,
        });
    }

    return Object.entries(analytics)
        .filter(([, data]) => data.length > 0)
        .map(([label, data]) => ({
            label,
            data,
            percentageChange: 0,
        }));
}
