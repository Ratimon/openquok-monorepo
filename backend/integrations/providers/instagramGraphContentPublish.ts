/**
 * Instagram feed publish via Content Publishing API.
 * Standalone: `graph.instagram.com`. Facebook Business: `graph.facebook.com` + Page token.
 *
 * @see https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 */
import type { PostDetails, PostResponse } from "../social.integrations.interface";
import { publicUrlForObjectKey } from "../../repositories/MediaRepository";
import { logger } from "../../utils/Logger";

const DEFAULT_API_VERSION = "v20.0";
const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ROUNDS = 60;

type ComposerMediaItem = { path?: string; bucket?: string; thumbnailTimestamp?: number };

function sleepMs(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function mediaExtFromUrlOrKey(path: string): string {
    const raw = String(path || "").trim();
    if (!raw) return "";
    try {
        const u = new URL(raw);
        const p = u.pathname || "";
        return (p.split(".").pop() ?? "").toLowerCase();
    } catch {
        return (raw.split("?")[0]?.split("#")[0]?.split(".").pop() ?? "").toLowerCase();
    }
}

function assertInstagramSupportedMedia(pathOrUrl: string): void {
    const ext = mediaExtFromUrlOrKey(pathOrUrl);
    if (ext === "svg") {
        throw new Error("Instagram does not support SVG. Use JPEG or PNG.");
    }
}

function extractComposerMedia(settings: unknown): ComposerMediaItem[] {
    if (!settings || typeof settings !== "object") return [];
    const s = settings as { media?: { items?: unknown } | unknown[] };
    const media = s.media;
    if (Array.isArray(media)) {
        return media.filter((m): m is ComposerMediaItem => !!m && typeof (m as ComposerMediaItem).path === "string");
    }
    const items = (media as { items?: unknown } | undefined)?.items;
    if (Array.isArray(items)) {
        return items.filter((m): m is ComposerMediaItem => !!m && typeof (m as ComposerMediaItem).path === "string");
    }
    return [];
}

function resolvePublicMediaUrl(path: string): string {
    const raw = path.trim();
    if (!raw) throw new Error("Media path is empty");
    assertInstagramSupportedMedia(raw);
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
        return raw;
    }
    const url = publicUrlForObjectKey(raw);
    if (!url) {
        throw new Error(
            "Cannot build a public media URL for Instagram (set STORAGE_R2_PUBLIC_BASE_URL for R2, or use full https:// URLs)"
        );
    }
    return url;
}

async function readGraphJson(res: Response): Promise<unknown> {
    const text = await res.text();
    if (!text) return {};
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return { _nonJsonBody: text };
    }
}

function formatGraphError(prefix: string, res: Response, body: unknown): string {
    const b = body as {
        error?: { message?: string; error_user_msg?: string; error_subcode?: number; code?: number };
        _nonJsonBody?: string;
    };
    if (b?.error?.message) {
        const extra = [b.error.error_user_msg].filter(Boolean).join(" — ");
        return `${prefix}: ${b.error.message}${extra ? ` (${extra})` : ""}`;
    }
    if (b && typeof b === "object" && "_nonJsonBody" in b && typeof b._nonJsonBody === "string") {
        return `${prefix}: HTTP ${res.status} — ${b._nonJsonBody.slice(0, 500)}`;
    }
    return `${prefix}: HTTP ${res.status}`;
}

function apiRoot(hostname: string, apiVersion: string): string {
    const host = hostname.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const ver = apiVersion.replace(/^\//, "");
    return `https://${host}/${ver}`;
}

async function assertUrlPubliclyReachable(url: string): Promise<void> {
    let res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (res.status === 405 || res.status === 501) {
        res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, redirect: "follow" });
    }
    if (!res.ok) {
        throw new Error(
            `Instagram media URL is not publicly reachable (HTTP ${res.status}). Meta must fetch this URL. url=${url}`
        );
    }
}

async function waitForMediaContainerReady(
    root: string,
    creationId: string,
    accessToken: string
): Promise<void> {
    for (let i = 0; i < POLL_MAX_ROUNDS; i++) {
        const res = await fetch(
            `${root}/${encodeURIComponent(creationId)}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`
        );
        const json = (await readGraphJson(res)) as {
            status_code?: string;
            status?: string;
            error?: { message?: string };
        };
        if (!res.ok) {
            throw new Error(formatGraphError("Instagram media status check failed", res, json));
        }
        const code = (json.status_code ?? json.status ?? "").toUpperCase();
        if (code === "ERROR" || code === "EXPIRED") {
            throw new Error(`Instagram media container ${code}. ${JSON.stringify(json).slice(0, 800)}`);
        }
        if (code && code !== "IN_PROGRESS") {
            return;
        }
        await sleepMs(POLL_INTERVAL_MS);
    }
    throw new Error("Instagram media processing timed out");
}

async function postForm(
    url: string,
    params: Record<string, string>
): Promise<{ res: Response; json: unknown }> {
    const body = new URLSearchParams(params);
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
    const json = await readGraphJson(res);
    return { res, json };
}

export type InstagramContentPublishTarget = {
    /** e.g. `graph.instagram.com` or `graph.facebook.com` */
    graphHostname: string;
    /** Default `v20.0`. */
    apiVersion?: string;
};

/**
 * Publishes one feed post (single image/video, carousel, or multi-story) for the given IG user id.
 */
export async function publishInstagramGraphFeedPost(
    igUserId: string,
    accessToken: string,
    first: PostDetails,
    target: InstagramContentPublishTarget
): Promise<PostResponse[]> {
    const version = target.apiVersion ?? DEFAULT_API_VERSION;
    const root = apiRoot(target.graphHostname, version);
    const rawItems = extractComposerMedia(first.settings);
    const medias = rawItems.map((m) => ({ ...m, path: resolvePublicMediaUrl(String(m.path)) }));

    if (medias.length === 0) {
        throw new Error("Instagram requires at least one image or video");
    }

    for (const m of medias) {
        await assertUrlPubliclyReachable(m.path);
    }

    const settings = (first.settings ?? {}) as {
        post_type?: string;
        is_trial_reel?: boolean;
        graduation_strategy?: string;
        collaborators?: Array<{ label?: string }>;
    };
    const isStory = settings.post_type === "story";
    const isTrialReel = Boolean(settings.is_trial_reel);
    const message = first.message ?? "";

    logger.info({
        msg: "[Instagram] publishing media",
        igUserId,
        graph: target.graphHostname,
        mediaCount: medias.length,
        isStory,
    });

    const creationIds: string[] = [];

    for (const m of medias) {
        const isVideo = m.path.toLowerCase().includes(".mp4");
        const caption =
            medias.length === 1 && !isStory ? `&caption=${encodeURIComponent(message)}` : "";
        const isCarousel = medias.length > 1 && !isStory ? "&is_carousel_item=true" : "";

        let mediaQuery: string;
        if (isVideo) {
            if (medias.length === 1) {
                if (isStory) {
                    mediaQuery = `video_url=${encodeURIComponent(m.path)}&media_type=STORIES`;
                } else {
                    mediaQuery = `video_url=${encodeURIComponent(m.path)}&media_type=REELS&thumb_offset=${encodeURIComponent(String(m.thumbnailTimestamp ?? 0))}`;
                }
            } else if (isStory) {
                mediaQuery = `video_url=${encodeURIComponent(m.path)}&media_type=STORIES`;
            } else {
                mediaQuery = `video_url=${encodeURIComponent(m.path)}&media_type=VIDEO&thumb_offset=${encodeURIComponent(String(m.thumbnailTimestamp ?? 0))}`;
            }
        } else if (isStory) {
            mediaQuery = `image_url=${encodeURIComponent(m.path)}&media_type=STORIES`;
        } else {
            mediaQuery = `image_url=${encodeURIComponent(m.path)}`;
        }

        const trialParams = isTrialReel
            ? `&trial_params=${encodeURIComponent(
                  JSON.stringify({
                      graduation_strategy: settings.graduation_strategy || "MANUAL",
                  })
              )}`
            : "";

        const collaborators =
            Array.isArray(settings.collaborators) &&
            settings.collaborators.length > 0 &&
            !isStory
                ? `&collaborators=${encodeURIComponent(JSON.stringify(settings.collaborators.map((p) => p.label).filter(Boolean)))}`
                : "";

        const url =
            `${root}/${encodeURIComponent(igUserId)}/media?${mediaQuery}${isCarousel}${collaborators}${trialParams}${caption}&access_token=${encodeURIComponent(accessToken)}`;

        const createRes = await fetch(url, { method: "POST" });
        const createJson = (await readGraphJson(createRes)) as { id?: string; error?: { message?: string } };
        if (!createRes.ok || !createJson.id) {
            throw new Error(formatGraphError("Instagram create media container failed", createRes, createJson));
        }

        await waitForMediaContainerReady(root, createJson.id, accessToken);
        creationIds.push(createJson.id);
    }

    if (isStory && creationIds.length > 1) {
        let lastMediaId = "";
        let lastPermalink = "";
        for (const creationId of creationIds) {
            const pub = await postForm(`${root}/${encodeURIComponent(igUserId)}/media_publish`, {
                creation_id: creationId,
                access_token: accessToken,
            });
            const pubJson = pub.json as { id?: string; error?: { message?: string } };
            if (!pub.res.ok || !pubJson.id) {
                throw new Error(formatGraphError("Instagram media_publish failed", pub.res, pubJson));
            }
            lastMediaId = pubJson.id;
            const permRes = await fetch(
                `${root}/${encodeURIComponent(pubJson.id)}?fields=permalink&access_token=${encodeURIComponent(accessToken)}`
            );
            const permJson = (await readGraphJson(permRes)) as { permalink?: string };
            if (permRes.ok && permJson.permalink) {
                lastPermalink = permJson.permalink;
            }
        }
        return [
            {
                id: first.id,
                postId: lastMediaId,
                releaseURL: lastPermalink,
                status: "success",
            },
        ];
    }

    if (creationIds.length === 1) {
        const pub = await postForm(`${root}/${encodeURIComponent(igUserId)}/media_publish`, {
            creation_id: creationIds[0]!,
            access_token: accessToken,
        });
        const pubJson = pub.json as { id?: string; error?: { message?: string } };
        if (!pub.res.ok || !pubJson.id) {
            throw new Error(formatGraphError("Instagram media_publish failed", pub.res, pubJson));
        }
        const permRes = await fetch(
            `${root}/${encodeURIComponent(pubJson.id)}?fields=permalink&access_token=${encodeURIComponent(accessToken)}`
        );
        const permJson = (await readGraphJson(permRes)) as { permalink?: string; error?: { message?: string } };
        if (!permRes.ok) {
            throw new Error(formatGraphError("Instagram load permalink failed", permRes, permJson));
        }
        return [
            {
                id: first.id,
                postId: pubJson.id,
                releaseURL: permJson.permalink ?? "",
                status: "success",
            },
        ];
    }

    const carouselUrl =
        `${root}/${encodeURIComponent(igUserId)}/media?caption=${encodeURIComponent(message)}` +
        `&media_type=CAROUSEL&children=${encodeURIComponent(creationIds.join(","))}` +
        `&access_token=${encodeURIComponent(accessToken)}`;

    const carRes = await fetch(carouselUrl, { method: "POST" });
    const carJson = (await readGraphJson(carRes)) as { id?: string; error?: { message?: string } };
    if (!carRes.ok || !carJson.id) {
        throw new Error(formatGraphError("Instagram create carousel container failed", carRes, carJson));
    }
    await waitForMediaContainerReady(root, carJson.id, accessToken);

    const pub2 = await postForm(`${root}/${encodeURIComponent(igUserId)}/media_publish`, {
        creation_id: carJson.id,
        access_token: accessToken,
    });
    const pub2Json = pub2.json as { id?: string; error?: { message?: string } };
    if (!pub2.res.ok || !pub2Json.id) {
        throw new Error(formatGraphError("Instagram carousel media_publish failed", pub2.res, pub2Json));
    }
    const perm2 = await fetch(
        `${root}/${encodeURIComponent(pub2Json.id)}?fields=permalink&access_token=${encodeURIComponent(accessToken)}`
    );
    const perm2Json = (await readGraphJson(perm2)) as { permalink?: string };
    if (!perm2.ok) {
        throw new Error(formatGraphError("Instagram carousel permalink failed", perm2, perm2Json));
    }
    return [
        {
            id: first.id,
            postId: pub2Json.id,
            releaseURL: perm2Json.permalink ?? "",
            status: "success",
        },
    ];
}
