import type { PostDetails, PostResponse } from "../../social.integrations.interface";

import { publicUrlForObjectKey } from "../../../repositories/MediaRepository";
import { throwIfMetaGraphInvalidAccessToken } from "../../../errors/metaGraphTokenError";

const GRAPH = "https://graph.facebook.com/v20.0";
const STORY_VIDEO_POLL_INTERVAL_MS = 10_000;
const STORY_VIDEO_DEADLINE_MS = 8 * 60 * 1000;

type MediaItem = { path: string; bucket?: string };

type SettingsWithMedia = { media?: { items?: MediaItem[] } | MediaItem[] };

const STORY_PARTIAL_PUBLISH_WARNING =
    "Publishing may have partially completed. One or more Facebook Stories may already be live. Check your Page before retrying.";

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractMedia(settings: unknown): MediaItem[] {
    if (!settings || typeof settings !== "object") return [];
    const media = (settings as SettingsWithMedia).media;
    if (Array.isArray(media)) {
        return media.filter((m): m is MediaItem => !!m && typeof m.path === "string" && m.path.length > 0);
    }
    const items = media?.items;
    if (Array.isArray(items)) {
        return items.filter((m): m is MediaItem => !!m && typeof m.path === "string" && m.path.length > 0);
    }
    return [];
}

function resolvePublicMediaUrl(path: string): string {
    const raw = path.trim();
    if (!raw) throw new Error("Media path is empty");
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const url = publicUrlForObjectKey(raw);
    if (!url) {
        throw new Error(
            "Cannot build a public media URL for Facebook (set STORAGE_R2_PUBLIC_BASE_URL for R2, or use full https:// URLs)"
        );
    }
    return url;
}

function isMp4Path(path: string): boolean {
    return path.toLowerCase().includes(".mp4") || path.toLowerCase().includes("mp4");
}

function sleepMs(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function graphPostJson(
    url: string,
    body: Record<string, unknown>,
    label: string
): Promise<Record<string, unknown>> {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const json = (await res.json()) as Record<string, unknown> & {
        error?: { message?: string };
    };
    throwIfMetaGraphInvalidAccessToken(json);
    if (json.error?.message) {
        throw new Error(`${label}: ${json.error.message}`);
    }
    return json;
}

async function graphGetJson(url: string, label: string): Promise<Record<string, unknown>> {
    const res = await fetch(url);
    const json = (await res.json()) as Record<string, unknown> & {
        error?: { message?: string };
    };
    throwIfMetaGraphInvalidAccessToken(json);
    if (json.error?.message) {
        throw new Error(`${label}: ${json.error.message}`);
    }
    return json;
}

function storyReleaseUrl(storyId: string): string {
    return `https://www.facebook.com/stories/${storyId}`;
}

/**
 * Reads Facebook post type from scheduled post settings or per-integration provider settings.
 *
 * Accepts flat CLI keys (`post_type`), web composer nested `facebook.postType`, and
 * `settings.providerSettings` wrappers used at publish time.
 */
export function readFacebookPostType(settings: unknown): "post" | "story" {
    if (!isPlainObject(settings)) return "post";

    let source: Record<string, unknown> = { ...settings };

    const providerSettings = settings.providerSettings;
    if (isPlainObject(providerSettings)) {
        const { facebook: facebookBucket, ...flatProviderSettings } = providerSettings;
        source = { ...source, ...flatProviderSettings };
        if (isPlainObject(facebookBucket)) {
            source = { ...source, ...facebookBucket };
        }
    } else if (isPlainObject(settings.facebook)) {
        source = { ...source, ...settings.facebook };
    }

    if (source.postType === "story" || source.post_type === "story") return "story";
    return "post";
}

async function uploadStoryPhoto(pageId: string, accessToken: string, mediaUrl: string): Promise<string> {
    const enc = encodeURIComponent(accessToken);
    const photoJson = await graphPostJson(
        `${GRAPH}/${pageId}/photos?access_token=${enc}`,
        { url: mediaUrl, published: false },
        "Facebook story photo upload"
    );
    const photoId = String(photoJson.id ?? "");
    if (!photoId) {
        throw new Error("Facebook story photo upload did not return a photo id");
    }

    const storyJson = await graphPostJson(
        `${GRAPH}/${pageId}/photo_stories?access_token=${enc}`,
        { photo_id: photoId },
        "Facebook photo story publish"
    );
    const storyId = String(storyJson.post_id ?? storyJson.id ?? photoId);
    return storyId;
}

async function startStoryVideoUpload(pageId: string, accessToken: string): Promise<{ videoId: string; uploadUrl: string }> {
    const enc = encodeURIComponent(accessToken);
    const startJson = await graphPostJson(
        `${GRAPH}/${pageId}/video_stories?upload_phase=start&access_token=${enc}`,
        {},
        "Facebook video story start"
    );
    const videoId = String(startJson.video_id ?? "");
    const uploadUrl = String(startJson.upload_url ?? "");
    if (!videoId || !uploadUrl) {
        throw new Error("Facebook video story start did not return video_id and upload_url");
    }
    return { videoId, uploadUrl };
}

async function uploadStoryVideoFile(uploadUrl: string, mediaUrl: string): Promise<void> {
    const res = await fetch(uploadUrl, {
        method: "POST",
        body: new URLSearchParams({ file_url: mediaUrl }),
    });
    const json = (await res.json()) as { error?: { message?: string }; success?: boolean };
    throwIfMetaGraphInvalidAccessToken(json);
    if (json.error?.message) {
        throw new Error(`Facebook video story file upload: ${json.error.message}`);
    }
    if (!res.ok && json.success !== true) {
        throw new Error(`Facebook video story file upload failed (HTTP ${res.status})`);
    }
}

function isFacebookVideoReady(status: unknown): boolean {
    if (!status || typeof status !== "object") return false;
    const s = status as Record<string, unknown>;
    if (s.uploading_phase === "complete" || s.uploading_phase === "upload_complete") return true;
    if (s.processing_phase === "complete" || s.processing_phase === "ready") return true;
    if (s.video_status === "ready" || s.video_status === "upload_complete") return true;
    return false;
}

async function waitForFacebookVideoReady(videoId: string, accessToken: string, deadlineMs: number): Promise<void> {
    const enc = encodeURIComponent(accessToken);
    const deadline = Date.now() + deadlineMs;

    while (Date.now() < deadline) {
        const json = await graphGetJson(
            `${GRAPH}/${videoId}?fields=status&access_token=${enc}`,
            "Facebook video story status"
        );
        if (isFacebookVideoReady(json.status)) {
            return;
        }
        await sleepMs(STORY_VIDEO_POLL_INTERVAL_MS);
    }
    throw new Error("Facebook video story processing timed out");
}

async function finishStoryVideo(pageId: string, accessToken: string, videoId: string): Promise<string> {
    const enc = encodeURIComponent(accessToken);
    const finishJson = await graphPostJson(
        `${GRAPH}/${pageId}/video_stories?upload_phase=finish&video_id=${encodeURIComponent(videoId)}&access_token=${enc}`,
        {},
        "Facebook video story finish"
    );
    return String(finishJson.post_id ?? finishJson.id ?? videoId);
}

async function publishStoryVideo(pageId: string, accessToken: string, mediaUrl: string): Promise<string> {
    const { videoId, uploadUrl } = await startStoryVideoUpload(pageId, accessToken);
    await uploadStoryVideoFile(uploadUrl, mediaUrl);
    await waitForFacebookVideoReady(videoId, accessToken, STORY_VIDEO_DEADLINE_MS);
    return finishStoryVideo(pageId, accessToken, videoId);
}

/** Publish one or more Facebook Page Stories (each media item becomes its own Story). */
export async function publishFacebookPageStories(
    pageId: string,
    accessToken: string,
    postDetails: PostDetails
): Promise<PostResponse> {
    const media = extractMedia(postDetails.settings).map((m) => ({
        ...m,
        path: resolvePublicMediaUrl(m.path),
    }));

    if (media.length === 0) {
        throw new Error("Story should have at least one media");
    }

    let lastStoryId = "";
    let publishedCount = 0;

    try {
        for (const item of media) {
            if (isMp4Path(item.path)) {
                lastStoryId = await publishStoryVideo(pageId, accessToken, item.path);
            } else {
                lastStoryId = await uploadStoryPhoto(pageId, accessToken, item.path);
            }
            publishedCount += 1;
        }
    } catch (error) {
        if (publishedCount > 0) {
            throw new Error(STORY_PARTIAL_PUBLISH_WARNING);
        }
        throw error;
    }

    return {
        id: postDetails.id,
        postId: lastStoryId,
        status: "success",
        releaseURL: storyReleaseUrl(lastStoryId),
    };
}
