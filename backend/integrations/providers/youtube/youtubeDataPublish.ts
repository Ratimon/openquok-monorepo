import type { PostDetails, PostResponse } from "../../social.integrations.interface";
import { resolveYoutubeSettings } from "./resolveYoutubeSettings";
import {
    extractYoutubeMediaFromSettings,
    resolveYoutubePublicMediaUrl,
    validateYoutubeTitle,
    validateYoutubeVideoMedia,
} from "./youtubePublishValidation";

import { Readable } from "node:stream";
import { google } from "googleapis";

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
        const thumbUrl = resolveYoutubePublicMediaUrl(settings.thumbnailPath);
        const thumbBody = await fetchAsNodeStream(thumbUrl);
        try {
            await youtube.thumbnails.set({
                videoId,
                media: { body: thumbBody },
            });
        } catch (err) {
            throw new Error(`YouTube thumbnail upload failed: ${mapYoutubeApiError(err)}`);
        }
    }

    return {
        id: postDetails.id,
        postId: videoId,
        status: "success",
        releaseURL: `https://www.youtube.com/watch?v=${videoId}`,
    };
}
