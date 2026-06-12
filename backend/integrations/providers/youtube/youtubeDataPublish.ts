import type { PostDetails, PostResponse } from "../../social.integrations.interface";
import { resolveYoutubeSettings } from "./resolveYoutubeSettings";
import {
    extractYoutubeMediaFromSettings,
    resolveYoutubePublicMediaUrl,
    shouldSkipYoutubeThumbnail,
    validateYoutubeTitle,
    validateYoutubeVideoMedia,
    YOUTUBE_THUMBNAIL_MAX_BYTES,
} from "./youtubePublishValidation";

import { Readable } from "node:stream";
import { google } from "googleapis";
import { logger } from "../../../utils/Logger";

function mapYoutubeApiError(err: unknown): string {
    if (!err || typeof err !== "object") return "YouTube upload failed";
    const e = err as { message?: string; errors?: Array<{ message?: string; reason?: string }> };
    const parts = (e.errors ?? [])
        .map((row) => row.message || row.reason)
        .filter((x): x is string => typeof x === "string" && x.length > 0);
    if (parts.length > 0) return parts.join("; ");
    if (typeof e.message === "string" && e.message.trim()) return e.message.trim();
    return "YouTube upload failed";
}

async function fetchAsNodeStream(url: string): Promise<Readable> {
    const res = await fetch(url);
    if (!res.ok || !res.body) {
        throw new Error(`Failed to download media (${res.status})`);
    }
    return Readable.fromWeb(res.body as import("node:stream/web").ReadableStream);
}

async function remoteContentLength(url: string): Promise<number | null> {
    try {
        const head = await fetch(url, { method: "HEAD" });
        if (!head.ok) return null;
        const raw = head.headers.get("content-length");
        if (!raw) return null;
        const n = Number.parseInt(raw, 10);
        return Number.isFinite(n) && n >= 0 ? n : null;
    } catch {
        return null;
    }
}

async function trySetYoutubeThumbnail(
    youtube: ReturnType<typeof google.youtube>,
    videoId: string,
    thumbnailPath: string,
    postId: string
): Promise<void> {
    const thumbUrl = resolveYoutubePublicMediaUrl(thumbnailPath);
    const byteLength = await remoteContentLength(thumbUrl);
    if (shouldSkipYoutubeThumbnail(byteLength)) {
        logger.warn({
            msg: "[YouTube] skipping custom thumbnail (exceeds 2 MiB limit)",
            postId,
            videoId,
            byteLength,
            limit: YOUTUBE_THUMBNAIL_MAX_BYTES,
        });
        return;
    }

    const thumbBody = await fetchAsNodeStream(thumbUrl);
    try {
        await youtube.thumbnails.set({
            videoId,
            media: { body: thumbBody },
        });
    } catch (err) {
        // Video is already live; a thumbnail failure must not fail the publish or trigger re-upload on retry.
        logger.warn({
            msg: "[YouTube] custom thumbnail upload failed; video published without it",
            postId,
            videoId,
            error: mapYoutubeApiError(err),
        });
    }
}

export async function publishYoutubeVideo(
    _channelId: string,
    accessToken: string,
    postDetails: PostDetails
): Promise<PostResponse> {
    const settings = resolveYoutubeSettings(postDetails.settings, postDetails.message ?? "");
    validateYoutubeTitle(settings.title);

    const media = extractYoutubeMediaFromSettings(postDetails.settings);
    validateYoutubeVideoMedia(media);

    const videoUrl = resolveYoutubePublicMediaUrl(media[0]!.path);
    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2 });

    const videoBody = await fetchAsNodeStream(videoUrl);
    let insertResponse;
    try {
        insertResponse = await youtube.videos.insert({
            part: ["snippet", "status"],
            requestBody: {
                snippet: {
                    title: settings.title,
                    description: settings.description,
                    tags: settings.tags.length > 0 ? settings.tags : undefined,
                },
                status: {
                    privacyStatus: settings.privacyStatus,
                    selfDeclaredMadeForKids: settings.selfDeclaredMadeForKids,
                },
            },
            media: {
                body: videoBody,
            },
        });
    } catch (err) {
        throw new Error(mapYoutubeApiError(err));
    }

    const videoId = insertResponse.data.id;
    if (!videoId) {
        throw new Error("YouTube upload succeeded but no video id was returned");
    }

    if (settings.thumbnailPath) {
        await trySetYoutubeThumbnail(youtube, videoId, settings.thumbnailPath, postDetails.id);
    }

    return {
        id: postDetails.id,
        postId: videoId,
        status: "success",
        releaseURL: `https://www.youtube.com/watch?v=${videoId}`,
    };
}
