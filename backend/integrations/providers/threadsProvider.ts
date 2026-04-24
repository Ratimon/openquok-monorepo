import type {
    AuthTokenDetails,
    GenerateAuthUrlResponse,
    IntegrationRecord,
    PostDetails,
    PostResponse,
    SocialProvider,
} from "../social.integrations.interface";

import dayjs from "dayjs";
import { config } from "../../config/GlobalConfig";
import { makeId } from "../../utils/make.is";
import { publicUrlForObjectKey } from "../../repositories/MediaRepository";
import { oauthFrontendOrigin } from "../utils/oauthFrontendOrigin";
import { logger } from "../../utils/Logger";

type ThreadsMediaItem = { path: string; bucket?: string };
type ThreadsSettingsWithMedia = { media?: { items?: ThreadsMediaItem[] } | ThreadsMediaItem[] };

const GRAPH = "https://graph.threads.net/v1.0";

// to do : remove this log (debug purpose)
/** Bumped when publish request shape or error handling changes (verify worker picked up `backend` build). */
const THREADS_PROVIDER_BUILD = "2026-04-24d";

function sleepMs(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function threadsRedirectUri(): string {
    return `${oauthFrontendOrigin()}/account/integrations/social/threads`;
}

function threadsOAuth(): { appId: string; appSecret: string } {
    return (config.integrations as { threads: { appId: string; appSecret: string } }).threads;
}

/** Meta Threads OAuth provider. */
export class ThreadsProvider implements SocialProvider {
    identifier = "threads";
    name = "Threads";
    editor = "normal" as const;
    isBetweenSteps = false;
    refreshCron = true;

    scopes = [
        "threads_basic",
        "threads_content_publish",
        "threads_manage_replies",
        "threads_manage_insights",
    ];

    maxLength(_additionalSettings?: unknown): number {
        return 500;
    }

    async post(
        userId: string,
        accessToken: string,
        postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];

        const [first] = postDetails;
        logger.info({ msg: "[Threads] post()", build: THREADS_PROVIDER_BUILD, postId: first.id });
        const message = first.message ?? "";
        const media = this.extractMedia(first.settings as ThreadsSettingsWithMedia).map((m) => ({
            ...m,
            path: this.resolvePublicMediaUrl(m.path),
        }));
        if (media.length > 0) {
            logger.info({
                msg: "[Threads] publishing with media (resolved public URLs)",
                postId: first.id,
                urls: media.map((m) => m.path),
            });
            for (const m of media) {
                await this.assertUrlReachableForThreads(m.path);
            }
        }

        const creationId =
            media.length === 0
                ? await this.createTextContent(userId, accessToken, message)
                : media.length === 1
                  ? await this.createSingleMediaContent(userId, accessToken, media[0], message)
                  : await this.createCarouselContent(userId, accessToken, media, message);

        const { threadId, permalink } = await this.publishThread(userId, accessToken, creationId);

        return [
            {
                id: first.id,
                postId: threadId,
                status: "success",
                releaseURL: permalink,
            },
        ];
    }

    async refreshToken(refresh_token: string): Promise<AuthTokenDetails> {
        const { appId } = threadsOAuth();
        if (!appId) throw new Error("THREADS_APP_ID is not configured");

        const tokenRes = await fetch(
            `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(refresh_token)}`
        );
        const { access_token } = (await tokenRes.json()) as { access_token?: string };
        if (!access_token) throw new Error("Threads token refresh failed");

        const { id, name, username, picture } = await this.fetchUserInfo(access_token);
        return {
            id,
            name,
            accessToken: access_token,
            refreshToken: access_token,
            expiresIn: dayjs().add(58, "days").unix() - dayjs().unix(),
            picture: picture || "",
            username: username || "",
        };
    }

    async generateAuthUrl(): Promise<GenerateAuthUrlResponse> {
        const { appId } = threadsOAuth();
        if (!appId) throw new Error("THREADS_APP_ID is not configured");

        const state = makeId(6);
        const codeVerifier = makeId(10);
        const redirectUri = threadsRedirectUri();
        const url =
            "https://www.threads.net/oauth/authorize" +
            `?client_id=${appId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&state=${state}` +
            `&scope=${encodeURIComponent(this.scopes.join(","))}`;

        return { url, codeVerifier, state };
    }

    async authenticate(params: { code: string; codeVerifier: string; refresh?: string }): Promise<AuthTokenDetails | string> {
        const { appId, appSecret: secret } = threadsOAuth();
        if (!appId || !secret) return "Threads OAuth is not configured";

        const step1 = await fetch(
            "https://graph.threads.net/oauth/access_token" +
                `?client_id=${appId}` +
                `&redirect_uri=${encodeURIComponent(threadsRedirectUri())}` +
                "&grant_type=authorization_code" +
                `&client_secret=${secret}` +
                `&code=${encodeURIComponent(params.code)}`
        );
        const getAccessToken = (await step1.json()) as { access_token?: string; error?: { message?: string } };
        if (!getAccessToken.access_token) {
            return getAccessToken.error?.message ?? "Threads token exchange failed";
        }

        const step2 = await fetch(
            "https://graph.threads.net/access_token" +
                "?grant_type=th_exchange_token" +
                `&client_secret=${secret}` +
                `&access_token=${encodeURIComponent(getAccessToken.access_token)}`
        );
        const longLived = (await step2.json()) as { access_token?: string };
        if (!longLived.access_token) return "Threads long-lived token exchange failed";

        const { id, name, username, picture } = await this.fetchUserInfo(longLived.access_token);
        return {
            id,
            name,
            accessToken: longLived.access_token,
            refreshToken: longLived.access_token,
            expiresIn: dayjs().add(58, "days").unix() - dayjs().unix(),
            picture: picture || "",
            username: username || "",
        };
    }

    private extractMedia(settings: ThreadsSettingsWithMedia | undefined | null): ThreadsMediaItem[] {
        const anySettings = (settings ?? {}) as ThreadsSettingsWithMedia;
        const media = anySettings.media;

        if (Array.isArray(media)) {
            return media.filter((m): m is ThreadsMediaItem => !!m && typeof m.path === "string" && m.path.length > 0);
        }

        const items = media?.items;
        if (Array.isArray(items)) {
            return items.filter((m): m is ThreadsMediaItem => !!m && typeof m.path === "string" && m.path.length > 0);
        }

        return [];
    }

    /**
     * Composer media stores an object key (R2) in `path`. Threads needs a public HTTPS URL in `image_url` / `video_url`
     */
    private resolvePublicMediaUrl(path: string): string {
        const raw = path.trim();
        if (!raw) {
            throw new Error("Media path is empty");
        }
        if (raw.startsWith("http://") || raw.startsWith("https://")) {
            return raw;
        }
        const url = publicUrlForObjectKey(raw);
        if (!url) {
            throw new Error(
                "Cannot build a public media URL for Threads (set STORAGE_R2_PUBLIC_BASE_URL for R2, or use full https:// URLs)"
            );
        }
        return url;
    }

    private async readGraphJson(res: Response): Promise<unknown> {
        const text = await res.text();
        if (!text) return {};
        try {
            return JSON.parse(text) as unknown;
        } catch {
            return { _nonJsonBody: text };
        }
    }

    private formatGraphError(prefix: string, res: Response, body: unknown): string {
        const b = body as {
            error?: { message?: string; error_subcode?: number; code?: number; error_user_msg?: string; error_user_title?: string };
            _nonJsonBody?: string;
        };
        if (b?.error?.message) {
            const extra = [b.error.error_user_msg, b.error.error_user_title].filter(Boolean).join(" — ");
            const base = `${prefix}: ${b.error.message}${extra ? ` (${extra})` : ""}`;
            if (b.error.message === "An unknown error occurred" || b.error.message.toLowerCase().includes("unknown")) {
                return `${base} [raw: ${JSON.stringify(b).slice(0, 1200)}]`;
            }
            return base;
        }
        if (b && typeof b === "object" && "_nonJsonBody" in b && typeof b._nonJsonBody === "string") {
            return `${prefix}: HTTP ${res.status} — ${b._nonJsonBody.slice(0, 500)}`;
        }
        return `${prefix}: HTTP ${res.status} [raw: ${JSON.stringify(body).slice(0, 1200)}]`;
    }

    /** Meta fetches `image_url` from their servers; if the URL 403s or is localhost, publish fails with vague Graph errors. */
    private async assertUrlReachableForThreads(url: string): Promise<void> {
        let res = await fetch(url, { method: "HEAD", redirect: "follow" });
        if (res.status === 405 || res.status === 501) {
            res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, redirect: "follow" });
        }
        if (!res.ok) {
            throw new Error(
                `Threads media URL is not publicly reachable (HTTP ${res.status}). Meta must fetch this URL; fix STORAGE_R2_PUBLIC_BASE_URL, bucket policy, or use a public https URL. url=${url}`
            );
        }
    }

    private async checkLoaded(creationId: string, accessToken: string): Promise<void> {
        for (let i = 0; i < 40; i++) {
            const res = await fetch(
                `${GRAPH}/${encodeURIComponent(creationId)}?fields=status,error_message&access_token=${encodeURIComponent(accessToken)}`
            );
            const json = (await this.readGraphJson(res)) as { status?: string; error_message?: string; error?: { message?: string } };
            if (!res.ok) {
                throw new Error(this.formatGraphError("Threads media status check failed", res, json));
            }
            const status = json.status ?? "";

            if (status === "ERROR") {
                const detail = (json.error_message as string | undefined) || "Threads media processing failed";
                const raw = JSON.stringify(json).slice(0, 2000);
                throw new Error(
                    `Threads media container ERROR: ${detail}. Full status payload: ${raw} (if this is UNKNOWN or a vague message, check image spec: JPEG/PNG, ≤8MB, public URL, sRGB)`
                );
            }
            if (status === "FINISHED") {
                await sleepMs(2000);
                return;
            }

            await sleepMs(2200);
        }

        throw new Error("Threads media processing timed out");
    }

    private async formPostThreads(userId: string, form: FormData | URLSearchParams): Promise<Response> {
        return await fetch(`${GRAPH}/${encodeURIComponent(userId)}/threads`, { method: "POST", body: form });
    }

    private async createTextContent(userId: string, accessToken: string, message: string): Promise<string> {
        const form = new FormData();
        form.append("media_type", "TEXT");
        form.append("text", message);
        form.append("access_token", accessToken);

        const res = await this.formPostThreads(userId, form);
        const json = (await this.readGraphJson(res)) as { id?: string; error?: { message?: string } };
        if (!json.id) {
            throw new Error(this.formatGraphError("Threads create text failed", res, json));
        }
        return json.id;
    }

    private async createSingleMediaContent(
        userId: string,
        accessToken: string,
        media: ThreadsMediaItem,
        message: string,
        isCarouselItem = false
    ): Promise<string> {
        const isVideo = media.path.toLowerCase().includes(".mp4");
        // Use multipart `FormData` like `createTextContent` (proven in app); Meta also accepts x-www-form-urlencoded in curl.
        const form = new FormData();
        form.append("media_type", isVideo ? "VIDEO" : "IMAGE");
        if (isVideo) {
            form.append("video_url", media.path);
        } else {
            form.append("image_url", media.path);
        }
        if (isCarouselItem) {
            form.append("is_carousel_item", "true");
        }
        form.append("text", message);
        form.append("access_token", accessToken);

        const res = await this.formPostThreads(userId, form);
        const json = (await this.readGraphJson(res)) as { id?: string; error?: { message?: string } };
        if (!json.id) {
            throw new Error(this.formatGraphError("Threads create media failed", res, json));
        }
        return json.id;
    }

    private async createCarouselContent(
        userId: string,
        accessToken: string,
        media: ThreadsMediaItem[],
        message: string
    ): Promise<string> {
        const mediaIds: string[] = [];
        for (const item of media) {
            const mediaId = await this.createSingleMediaContent(userId, accessToken, item, message, true);
            mediaIds.push(mediaId);
        }

        await Promise.all(mediaIds.map((id) => this.checkLoaded(id, accessToken)));

        const form = new FormData();
        form.append("text", message);
        form.append("media_type", "CAROUSEL");
        form.append("children", mediaIds.join(","));
        form.append("access_token", accessToken);

        const res = await this.formPostThreads(userId, form);
        const json = (await this.readGraphJson(res)) as { id?: string; error?: { message?: string } };
        if (!json.id) {
            throw new Error(this.formatGraphError("Threads create carousel failed", res, json));
        }
        return json.id;
    }

    private async publishThread(
        userId: string,
        accessToken: string,
        creationId: string
    ): Promise<{ threadId: string; permalink: string }> {
        await this.checkLoaded(creationId, accessToken);

        const pubForm = new FormData();
        pubForm.append("creation_id", creationId);
        pubForm.append("access_token", accessToken);
        const pubRes = await fetch(`${GRAPH}/${encodeURIComponent(userId)}/threads_publish`, {
            method: "POST",
            body: pubForm,
        });
        const pubJson = (await this.readGraphJson(pubRes)) as { id?: string; error?: { message?: string } };
        if (!pubJson.id) {
            throw new Error(this.formatGraphError("Threads publish failed", pubRes, pubJson));
        }

        const infoRes = await fetch(
            `${GRAPH}/${encodeURIComponent(pubJson.id)}?fields=id,permalink&access_token=${encodeURIComponent(accessToken)}`
        );
        const infoJson = (await this.readGraphJson(infoRes)) as { permalink?: string };
        if (!infoRes.ok) {
            throw new Error(this.formatGraphError("Threads fetch permalink failed", infoRes, infoJson));
        }

        return { threadId: pubJson.id, permalink: infoJson.permalink ?? "" };
    }

    private async fetchUserInfo(accessToken: string): Promise<{
        id: string;
        name: string;
        username: string;
        picture: string;
    }> {
        const res = await fetch(
            `https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${encodeURIComponent(accessToken)}`
        );
        const body = (await res.json()) as {
            id?: string;
            username?: string;
            threads_profile_picture_url?: string;
        };
        const id = body.id ?? "";
        const username = body.username ?? "";
        return {
            id,
            name: username,
            picture: body.threads_profile_picture_url || "",
            username,
        };
    }
}
