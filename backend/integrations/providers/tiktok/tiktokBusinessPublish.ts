import type { PostDetails, PostResponse } from "../../social.integrations.interface";
import {
    assertTiktokBusinessApiOk,
    tiktokBusinessApiGet,
    tiktokBusinessApiPost,
} from "./tiktokBusinessApiClient";
import { mapTiktokBusinessPublishFailReason } from "./tiktokBusinessApiErrors";
import {
    resolveTiktokBusinessSettings,
    type TiktokBusinessResolvedPublishSettings,
} from "./resolveTiktokBusinessSettings";
import {
    extractTiktokMediaFromSettings,
    resolveTiktokPublicMediaUrl,
    validateTiktokMedia,
    type TiktokMediaItem,
} from "./tiktokPublishValidation";

/** Production poll cadence; shortened under Jest so accidental unmocked publish calls fail fast. */
function tiktokBusinessStatusPollMs(): number {
    return process.env.JEST_WORKER_ID !== undefined ? 10 : 10_000;
}

function tiktokBusinessStatusMaxPolls(): number {
    return process.env.JEST_WORKER_ID !== undefined ? 5 : 360;
}

function sleepMs(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export type TiktokBusinessVideoCover = {
    customThumbnailUrl?: string;
    thumbnailOffsetMs?: number;
};

export function resolveTiktokBusinessVideoCover(media: TiktokMediaItem[]): TiktokBusinessVideoCover {
    if (media.length === 0) return {};
    const first = media[0]!;
    const thumbnail = first.thumbnail;
    if (typeof thumbnail === "string" && thumbnail.trim()) {
        return { customThumbnailUrl: resolveTiktokPublicMediaUrl(thumbnail.trim()) };
    }
    const ts = first.thumbnailTimestamp;
    if (typeof ts === "number" && Number.isFinite(ts) && ts >= 0) {
        return { thumbnailOffsetMs: Math.round(ts) };
    }
    return {};
}

function appendBusinessPostInfoExtras(
    postInfo: Record<string, unknown>,
    settings: TiktokBusinessResolvedPublishSettings,
    directPost: boolean
): void {
    if (directPost && settings.musicSoundInfo) {
        postInfo.music_sound_info = settings.musicSoundInfo;
    }
    if (directPost && settings.poiId) {
        postInfo.poi_id = settings.poiId;
    }
}

export function buildTiktokBusinessVideoBody(params: {
    businessId: string;
    videoUrl: string;
    caption: string;
    settings: TiktokBusinessResolvedPublishSettings;
    cover?: TiktokBusinessVideoCover;
}): Record<string, unknown> {
    const { businessId, videoUrl, caption, settings, cover } = params;
    const isUpload = settings.content_posting_method === "UPLOAD";
    const postInfo: Record<string, unknown> = {
        caption: caption.trim() || undefined,
        disable_comment: !settings.comment,
        disable_duet: !settings.duet,
        disable_stitch: !settings.stitch,
        is_brand_organic: settings.brand_organic_toggle,
        is_branded_content: settings.brand_content_toggle,
        is_ai_generated: settings.video_made_with_ai,
    };

    if (isUpload) {
        postInfo.upload_to_draft = true;
    } else {
        appendBusinessPostInfoExtras(postInfo, settings, true);
    }

    if (cover?.thumbnailOffsetMs !== undefined) {
        postInfo.thumbnail_offset = String(cover.thumbnailOffsetMs);
    }

    const body: Record<string, unknown> = {
        business_id: businessId,
        video_url: videoUrl,
        post_info: postInfo,
    };
    if (cover?.customThumbnailUrl) {
        body.custom_thumbnail_url = cover.customThumbnailUrl;
    }
    return body;
}

export function buildTiktokBusinessPhotoBody(params: {
    businessId: string;
    photoUrls: string[];
    caption: string;
    settings: TiktokBusinessResolvedPublishSettings;
}): Record<string, unknown> {
    const { businessId, photoUrls, caption, settings } = params;
    const isUpload = settings.content_posting_method === "UPLOAD";
    const title = settings.title.trim();
    const postInfo: Record<string, unknown> = {
        title: title || undefined,
        caption: caption.trim() || undefined,
        disable_comment: !settings.comment,
        is_brand_organic: settings.brand_organic_toggle,
        is_branded_content: settings.brand_content_toggle,
    };

    if (isUpload) {
        postInfo.is_draft = true;
    } else {
        postInfo.privacy_level = settings.privacy_level;
        postInfo.auto_add_music = settings.autoAddMusic;
        appendBusinessPostInfoExtras(postInfo, settings, true);
    }

    return {
        business_id: businessId,
        photo_images: photoUrls,
        photo_cover_index: 0,
        post_info: postInfo,
    };
}

async function pollTiktokBusinessPublishStatus(
    accessToken: string,
    businessId: string,
    publishId: string
): Promise<{ status: string; postId: string; failReason: string }> {
    const maxPolls = tiktokBusinessStatusMaxPolls();
    for (let i = 0; i < maxPolls; i++) {
        const envelope = await tiktokBusinessApiGet(accessToken, "/business/publish/status/", {
            business_id: businessId,
            publish_id: publishId,
        });
        const data = assertTiktokBusinessApiOk(envelope);

        const status = typeof data.status === "string" ? data.status : "";
        const failReason = typeof data.reason === "string" ? data.reason : "";
        const postId =
            typeof data.share_id === "string"
                ? data.share_id
                : typeof data.video_id === "string"
                  ? data.video_id
                  : "";

        if (status === "FAILED") {
            throw new Error(mapTiktokBusinessPublishFailReason(failReason));
        }
        if (status === "PUBLISH_COMPLETE" || status === "SEND_TO_USER_INBOX") {
            return { status, postId, failReason };
        }

        await sleepMs(tiktokBusinessStatusPollMs());
    }

    throw new Error("TikTok Business publish timed out while waiting for processing to complete");
}

function buildTiktokBusinessReleaseUrl(username: string | undefined, postId: string): string {
    if (!postId.trim()) return "";
    const handle = (username ?? "").replace(/^@/, "").trim();
    if (handle) {
        return `https://www.tiktok.com/@${encodeURIComponent(handle)}/video/${encodeURIComponent(postId)}`;
    }
    return "https://www.tiktok.com";
}

export async function publishTiktokBusinessPost(
    businessId: string,
    accessToken: string,
    postDetails: PostDetails,
    username?: string
): Promise<PostResponse> {
    const settings = resolveTiktokBusinessSettings(postDetails.settings, postDetails.message ?? "");
    const media = extractTiktokMediaFromSettings(postDetails.settings);
    const { kind, urls } = validateTiktokMedia(media);
    const caption = (postDetails.message ?? "").trim();

    let initPath: string;
    let initBody: Record<string, unknown>;

    if (kind === "video") {
        initPath = "/business/video/publish/";
        initBody = buildTiktokBusinessVideoBody({
            businessId,
            videoUrl: urls[0]!,
            caption,
            settings,
            cover: resolveTiktokBusinessVideoCover(media),
        });
    } else {
        initPath = "/business/photo/publish/";
        initBody = buildTiktokBusinessPhotoBody({
            businessId,
            photoUrls: urls,
            caption,
            settings,
        });
    }

    const init = await tiktokBusinessApiPost(accessToken, initPath, initBody);
    const initData = assertTiktokBusinessApiOk(init);

    const publishId =
        typeof initData.share_id === "string"
            ? initData.share_id
            : typeof initData.publish_id === "string"
              ? initData.publish_id
              : "";
    if (!publishId) {
        throw new Error("TikTok Business publish succeeded but no publish id was returned");
    }

    const polled = await pollTiktokBusinessPublishStatus(accessToken, businessId, publishId);

    if (polled.status === "SEND_TO_USER_INBOX") {
        return {
            id: postDetails.id,
            postId: "missing",
            status: "SEND_TO_USER_INBOX",
            releaseURL: "https://www.tiktok.com/messages?lang=en",
        };
    }

    const releaseURL = buildTiktokBusinessReleaseUrl(username, polled.postId || publishId);

    return {
        id: postDetails.id,
        postId: polled.postId || publishId,
        status: "success",
        releaseURL,
    };
}
