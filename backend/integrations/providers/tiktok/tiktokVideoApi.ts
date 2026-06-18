import type { AnalyticsData } from "../../social.integrations.interface";
import { tiktokApiPost } from "./tiktokApiClient";

import dayjs from "dayjs";

export type TiktokListedVideo = {
    id: string;
    cover_image_url?: string;
    title?: string;
};

export type TiktokVideoMetrics = {
    id: string;
    view_count?: number;
    like_count?: number;
    comment_count?: number;
    share_count?: number;
};

const RECENT_VIDEO_LIST_MAX = 20;

function readVideoArray(data: Record<string, unknown>): unknown[] {
    const videos = data.videos;
    return Array.isArray(videos) ? videos : [];
}

function readListedVideo(raw: unknown): TiktokListedVideo | null {
    if (!raw || typeof raw !== "object") return null;
    const row = raw as Record<string, unknown>;
    const id = row.id != null ? String(row.id).trim() : "";
    if (!id) return null;
    return {
        id,
        cover_image_url: typeof row.cover_image_url === "string" ? row.cover_image_url : undefined,
        title: typeof row.title === "string" ? row.title : undefined,
    };
}

function readVideoMetrics(raw: unknown): TiktokVideoMetrics | null {
    if (!raw || typeof raw !== "object") return null;
    const row = raw as Record<string, unknown>;
    const id = row.id != null ? String(row.id).trim() : "";
    if (!id) return null;
    const num = (key: string) => {
        const value = row[key];
        return typeof value === "number" && Number.isFinite(value) ? value : undefined;
    };
    return {
        id,
        view_count: num("view_count"),
        like_count: num("like_count"),
        comment_count: num("comment_count"),
        share_count: num("share_count"),
    };
}

/** Lists recent videos (`video.list` scope). */
export async function listTiktokVideos(
    accessToken: string,
    options: { fields: string; maxCount?: number }
): Promise<TiktokListedVideo[]> {
    const envelope = await tiktokApiPost(accessToken, `/v2/video/list/?fields=${encodeURIComponent(options.fields)}`, {
        max_count: options.maxCount ?? RECENT_VIDEO_LIST_MAX,
    });
    if (!envelope.ok) return [];

    const out: TiktokListedVideo[] = [];
    for (const raw of readVideoArray(envelope.data)) {
        const video = readListedVideo(raw);
        if (video) out.push(video);
    }
    return out;
}

/** Queries engagement metrics for known video ids (`video.list` scope). */
export async function queryTiktokVideoMetrics(
    accessToken: string,
    videoIds: string[]
): Promise<TiktokVideoMetrics[]> {
    const ids = [...new Set(videoIds.map((id) => id.trim()).filter(Boolean))];
    if (!ids.length) return [];

    const envelope = await tiktokApiPost(
        accessToken,
        "/v2/video/query/?fields=id,like_count,comment_count,share_count,view_count",
        { filters: { video_ids: ids } }
    );
    if (!envelope.ok) return [];

    const out: TiktokVideoMetrics[] = [];
    for (const raw of readVideoArray(envelope.data)) {
        const metrics = readVideoMetrics(raw);
        if (metrics) out.push(metrics);
    }
    return out;
}

/** Resolves a public video id from an interim TikTok publish id. */
export async function resolveTiktokPublicVideoId(
    accessToken: string,
    releaseId: string
): Promise<string | null> {
    const trimmed = releaseId.trim();
    if (!trimmed || trimmed === "missing") return null;
    if (!trimmed.includes("v_pub")) return trimmed;

    const envelope = await tiktokApiPost(accessToken, "/v2/post/publish/status/fetch/", {
        publish_id: trimmed,
    });
    if (!envelope.ok) return null;

    const postIds = envelope.data.publicaly_available_post_id;
    if (Array.isArray(postIds) && postIds.length > 0 && postIds[0] != null) {
        return String(postIds[0]);
    }
    return null;
}

function pushSnapshotMetric(rows: AnalyticsData[], label: string, total: number, today: string): void {
    rows.push({
        label,
        percentageChange: 0,
        data: [{ total: String(total), date: today }],
    });
}

/** Adds aggregated recent-video engagement rows (views, likes, comments, shares). */
export async function appendTiktokRecentVideoEngagement(
    accessToken: string,
    rows: AnalyticsData[],
    today: string
): Promise<void> {
    const listed = await listTiktokVideos(accessToken, { fields: "id" });
    if (!listed.length) return;

    const metrics = await queryTiktokVideoMetrics(
        accessToken,
        listed.map((video) => video.id)
    );
    if (!metrics.length) return;

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    for (const video of metrics) {
        totalViews += video.view_count ?? 0;
        totalLikes += video.like_count ?? 0;
        totalComments += video.comment_count ?? 0;
        totalShares += video.share_count ?? 0;
    }

    pushSnapshotMetric(rows, "Views", totalViews, today);
    pushSnapshotMetric(rows, "Recent Likes", totalLikes, today);
    pushSnapshotMetric(rows, "Recent Comments", totalComments, today);
    pushSnapshotMetric(rows, "Recent Shares", totalShares, today);
}

export function buildTiktokPostAnalyticsRows(metrics: TiktokVideoMetrics, today: string): AnalyticsData[] {
    const rows: AnalyticsData[] = [];
    if (metrics.view_count !== undefined) {
        pushSnapshotMetric(rows, "Views", metrics.view_count, today);
    }
    if (metrics.like_count !== undefined) {
        pushSnapshotMetric(rows, "Likes", metrics.like_count, today);
    }
    if (metrics.comment_count !== undefined) {
        pushSnapshotMetric(rows, "Comments", metrics.comment_count, today);
    }
    if (metrics.share_count !== undefined) {
        pushSnapshotMetric(rows, "Shares", metrics.share_count, today);
    }
    return rows;
}

export function tiktokAnalyticsToday(): string {
    return dayjs().format("YYYY-MM-DD");
}
