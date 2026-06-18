import type { PostDetails, PostResponse } from "../../social.integrations.interface";
import { resolveTiktokSettings, type TiktokResolvedPublishSettings } from "./resolveTiktokSettings";
import {
    extractTiktokMediaFromSettings,
    validateTiktokMedia,
} from "./tiktokPublishValidation";
import { tiktokApiPost } from "./tiktokApiClient";
import { mapTiktokApiErrorCode, mapTiktokFailReason } from "./tiktokApiErrors";

/** Production poll cadence; shortened under Jest so accidental unmocked publish calls fail fast. */
function tiktokStatusPollMs(): number {
    return process.env.JEST_WORKER_ID !== undefined ? 10 : 10_000;
}

function tiktokStatusMaxPolls(): number {
    return process.env.JEST_WORKER_ID !== undefined ? 5 : 360;
}

function sleepMs(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildTiktokVideoPostInfoBody(
    settings: TiktokResolvedPublishSettings,
    caption: string
): Record<string, unknown> {
    const title = (caption || settings.title).trim();
    return {
        title,
        privacy_level: settings.privacy_level,
        disable_duet: !settings.duet,
        disable_stitch: !settings.stitch,
        disable_comment: !settings.comment,
        brand_content_toggle: settings.brand_content_toggle,
        brand_organic_toggle: settings.brand_organic_toggle,
        is_aigc: settings.video_made_with_ai,
    };
}

export function buildTiktokPhotoPostInfoBody(
    settings: TiktokResolvedPublishSettings,
    caption: string,
    directPost: boolean
): Record<string, unknown> {
    const title = settings.title.trim();
    const description = caption.trim();
    const body: Record<string, unknown> = {
        title: title || undefined,
        description: description || undefined,
        brand_content_toggle: settings.brand_content_toggle,
        brand_organic_toggle: settings.brand_organic_toggle,
    };
    if (directPost) {
        body.privacy_level = settings.privacy_level;
        body.disable_comment = !settings.comment;
        body.auto_add_music = settings.autoAddMusic;
    }
    return body;
}

export function buildTiktokVideoSourceInfoBody(videoUrl: string): Record<string, unknown> {
    return {
        source: "PULL_FROM_URL",
        video_url: videoUrl,
    };
}

export function buildTiktokPhotoSourceInfoBody(photoUrls: string[]): Record<string, unknown> {
    return {
        source: "PULL_FROM_URL",
        photo_images: photoUrls,
        photo_cover_index: 0,
    };
}

async function pollTiktokPublishStatus(
    accessToken: string,
    publishId: string
): Promise<{ status: string; postId: string; failReason: string }> {
    const maxPolls = tiktokStatusMaxPolls();
    for (let i = 0; i < maxPolls; i++) {
        const envelope = await tiktokApiPost(accessToken, "/v2/post/publish/status/fetch/", {
            publish_id: publishId,
        });
        if (!envelope.ok) {
            throw new Error(mapTiktokApiErrorCode(envelope.errorCode, envelope.errorMessage));
        }

        const status = typeof envelope.data.status === "string" ? envelope.data.status : "";
        const failReason = typeof envelope.data.fail_reason === "string" ? envelope.data.fail_reason : "";
        const postIds = envelope.data.publicaly_available_post_id;
        const firstPostId =
            Array.isArray(postIds) && postIds.length > 0 && postIds[0] != null ? String(postIds[0]) : "";

        if (status === "FAILED") {
            throw new Error(mapTiktokFailReason(failReason));
        }
        if (status === "PUBLISH_COMPLETE" || status === "SEND_TO_USER_INBOX") {
            return { status, postId: firstPostId, failReason };
        }

        await sleepMs(tiktokStatusPollMs());
    }

    throw new Error("TikTok publish timed out while waiting for processing to complete");
}

function buildTiktokReleaseUrl(username: string | undefined, postId: string): string {
    if (!postId.trim()) return "";
    const handle = (username ?? "").replace(/^@/, "").trim();
    if (handle) {
        return `https://www.tiktok.com/@${encodeURIComponent(handle)}/video/${encodeURIComponent(postId)}`;
    }
    return `https://www.tiktok.com`;
}

export async function publishTiktokPost(
    _openId: string,
    accessToken: string,
    postDetails: PostDetails,
    username?: string
): Promise<PostResponse> {
    const settings = resolveTiktokSettings(postDetails.settings, postDetails.message ?? "");
    const media = extractTiktokMediaFromSettings(postDetails.settings);
    const { kind, urls } = validateTiktokMedia(media);
    const caption = (postDetails.message ?? "").trim();
    const isUpload = settings.content_posting_method === "UPLOAD";

    let initPath: string;
    let initBody: Record<string, unknown>;

    if (kind === "video") {
        const videoUrl = urls[0]!;
        if (isUpload) {
            initPath = "/v2/post/publish/inbox/video/init/";
            initBody = {
                source_info: buildTiktokVideoSourceInfoBody(videoUrl),
            };
        } else {
            initPath = "/v2/post/publish/video/init/";
            initBody = {
                post_info: buildTiktokVideoPostInfoBody(settings, caption),
                source_info: buildTiktokVideoSourceInfoBody(videoUrl),
            };
        }
    } else {
        initPath = "/v2/post/publish/content/init/";
        initBody = {
            media_type: "PHOTO",
            post_mode: isUpload ? "MEDIA_UPLOAD" : "DIRECT_POST",
            post_info: buildTiktokPhotoPostInfoBody(settings, caption, !isUpload),
            source_info: buildTiktokPhotoSourceInfoBody(urls),
        };
    }

    const init = await tiktokApiPost(accessToken, initPath, initBody);
    if (!init.ok) {
        throw new Error(mapTiktokApiErrorCode(init.errorCode, init.errorMessage));
    }

    const publishId = typeof init.data.publish_id === "string" ? init.data.publish_id : "";
    if (!publishId) {
        throw new Error("TikTok publish init succeeded but no publish_id was returned");
    }

    const polled = await pollTiktokPublishStatus(accessToken, publishId);

    if (polled.status === "SEND_TO_USER_INBOX") {
        return {
            id: postDetails.id,
            postId: "missing",
            status: "SEND_TO_USER_INBOX",
            releaseURL: "https://www.tiktok.com/messages?lang=en",
        };
    }

    const releaseURL = buildTiktokReleaseUrl(username, polled.postId);

    return {
        id: postDetails.id,
        postId: polled.postId || publishId,
        status: "success",
        releaseURL,
    };
}
