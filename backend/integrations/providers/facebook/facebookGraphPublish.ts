import type { PostDetails, PostResponse } from "../../social.integrations.interface";

import { publicUrlForObjectKey } from "../../../repositories/MediaRepository";
import { htmlToPlainText } from "../../../utils/content/htmlToPlain";
import { throwIfMetaGraphInvalidAccessToken } from "../../../errors/metaGraphTokenError";

const GRAPH = "https://graph.facebook.com/v20.0";

type MediaItem = { path: string; bucket?: string };

type SettingsWithMedia = { media?: { items?: MediaItem[] } | MediaItem[] };

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Resolves optional link preview URL from scheduled post settings.
 * Accepts flat `providerSettings.url` (CLI/API) and nested `providerSettings.facebook.url` (web composer).
 */
export function resolveFacebookLinkFromSettings(settings: unknown): string | undefined {
    if (!isPlainObject(settings)) return undefined;

    const readUrl = (source: Record<string, unknown>): string | undefined => {
        const url = source.url;
        if (typeof url === "string" && url.trim()) return url.trim();
        return undefined;
    };

    const providerSettings = settings.providerSettings;
    if (isPlainObject(providerSettings)) {
        const flat = readUrl(providerSettings);
        if (flat) return flat;

        const facebook = providerSettings.facebook;
        if (isPlainObject(facebook)) {
            const nested = readUrl(facebook);
            if (nested) return nested;
        }
    }

    if (isPlainObject(settings.facebook)) {
        return readUrl(settings.facebook);
    }

    return readUrl(settings);
}

function readLinkFromSettings(settings: unknown): string | undefined {
    return resolveFacebookLinkFromSettings(settings);
}

/** Publish a Facebook Page feed post, photo carousel, or video. */
export async function publishFacebookPagePost(
    pageId: string,
    accessToken: string,
    postDetails: PostDetails
): Promise<PostResponse> {
    const message = htmlToPlainText(postDetails.message ?? "").trim();
    const media = extractMedia(postDetails.settings).map((m) => ({
        ...m,
        path: resolvePublicMediaUrl(m.path),
    }));
    const link = readLinkFromSettings(postDetails.settings);
    const enc = encodeURIComponent(accessToken);

    if (media.length > 0 && isMp4Path(media[0]!.path)) {
        const videoJson = await graphPostJson(
            `${GRAPH}/${pageId}/videos?access_token=${enc}&fields=id,permalink_url`,
            {
                file_url: media[0]!.path,
                description: message,
                published: true,
            },
            "Facebook video upload"
        );
        const videoId = String(videoJson.id ?? "");
        const permalink = String(videoJson.permalink_url ?? `https://www.facebook.com/reel/${videoId}`);
        return {
            id: postDetails.id,
            postId: videoId,
            status: "success",
            releaseURL: permalink,
        };
    }

    const uploadPhotos =
        media.length === 0
            ? []
            : await Promise.all(
                  media.map(async (item) => {
                      const photoJson = await graphPostJson(
                          `${GRAPH}/${pageId}/photos?access_token=${enc}`,
                          { url: item.path, published: false },
                          "Facebook photo upload"
                      );
                      return { media_fbid: String(photoJson.id ?? "") };
                  })
              );

    const feedBody: Record<string, unknown> = {
        message,
        published: true,
        ...(uploadPhotos.length ? { attached_media: uploadPhotos } : {}),
        ...(link ? { link } : {}),
    };

    const feedJson = await graphPostJson(
        `${GRAPH}/${pageId}/feed?access_token=${enc}&fields=id,permalink_url`,
        feedBody,
        "Facebook feed publish"
    );

    return {
        id: postDetails.id,
        postId: String(feedJson.id ?? ""),
        status: "success",
        releaseURL: String(feedJson.permalink_url ?? ""),
    };
}

/** Publish a comment or nested reply on a Facebook post. */
export async function publishFacebookComment(
    replyToId: string,
    accessToken: string,
    postDetails: PostDetails
): Promise<PostResponse> {
    const message = htmlToPlainText(postDetails.message ?? "").trim();
    const media = extractMedia(postDetails.settings);
    const enc = encodeURIComponent(accessToken);
    const body: Record<string, unknown> = { message };
    if (media.length > 0) {
        body.attachment_url = resolvePublicMediaUrl(media[0]!.path);
    }

    const json = await graphPostJson(
        `${GRAPH}/${replyToId}/comments?access_token=${enc}&fields=id,permalink_url`,
        body,
        "Facebook comment"
    );

    return {
        id: postDetails.id,
        postId: String(json.id ?? ""),
        status: "success",
        releaseURL: String(json.permalink_url ?? ""),
    };
}
