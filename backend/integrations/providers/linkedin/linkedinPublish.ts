import type { PostDetails, PostResponse } from "../../social.integrations.interface";

import { UploadFactory } from "../../../connections/upload/upload.factory";
import { publicUrlForObjectKey } from "../../../repositories/MediaRepository";
import { storageR2Repository } from "../../../repositories/index";
import { htmlToPlainText } from "../../../utils/content/htmlToPlain";
import { mediaExtFromUrlOrKey } from "../tiktok/tiktokPublishValidation";
import { resolveLinkedInSettings } from "./linkedinSettings";
import { linkedinRestHeaders } from "./linkedinCommon";

type MediaItem = { path: string; bucket?: string };
type SettingsWithMedia = { media?: { items?: MediaItem[] } | MediaItem[] };

export type LinkedInAuthorType = "personal" | "company";

const CHUNK_BYTES = 2 * 1024 * 1024;

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
            "Cannot build a public media URL for LinkedIn (set STORAGE_R2_PUBLIC_BASE_URL for R2, or use full https:// URLs)"
        );
    }
    return url;
}

function isMp4Path(path: string): boolean {
    return path.toLowerCase().includes(".mp4") || path.toLowerCase().includes("mp4");
}

async function loadMediaBuffer(path: string): Promise<Buffer> {
    const resolved = path.startsWith("http://") || path.startsWith("https://") ? path : resolvePublicMediaUrl(path);
    if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
        const res = await fetch(resolved);
        if (!res.ok) {
            throw new Error(`Failed to download media for LinkedIn (HTTP ${res.status})`);
        }
        return Buffer.from(await res.arrayBuffer());
    }
    const upload = UploadFactory.createStorage(storageR2Repository);
    const { buffer } = await upload.downloadObject(path);
    return buffer;
}

/** Preserves `@[Name](urn:li:organization:ID)` tokens while escaping LinkedIn special chars. */
export function fixLinkedInCommentary(text: string): string {
    const pattern = /@\[.+?]\(urn:li:organization.+?\)/g;
    const matches = text.match(pattern) ?? [];
    const splitAll = text.split(pattern);
    const splitTextReformat = splitAll.map((p) =>
        p
            .replace(/\\/g, "\\\\")
            .replace(/</g, "\\<")
            .replace(/>/g, "\\>")
            .replace(/#/g, "\\#")
            .replace(/~/g, "\\~")
            .replace(/_/g, "\\_")
            .replace(/\|/g, "\\|")
            .replace(/\[/g, "\\[")
            .replace(/]/g, "\\]")
            .replace(/\*/g, "\\*")
            .replace(/\(/g, "\\(")
            .replace(/\)/g, "\\)")
            .replace(/\{/g, "\\{")
            .replace(/}/g, "\\}")
            .replace(/@/g, "\\@")
    );

    const connectAll = splitTextReformat.reduce((all, current) => {
        const match = matches.shift();
        all.push(current);
        if (match) all.push(match);
        return all;
    }, [] as string[]);

    return connectAll.join("");
}

function buildPostContent(isPdf: boolean, mediaIds: string[], pdfTitle?: string): Record<string, unknown> {
    if (mediaIds.length === 0) return {};

    if (mediaIds.length === 1) {
        return {
            content: {
                media: {
                    ...(isPdf ? { title: pdfTitle || "slides" } : {}),
                    id: mediaIds[0],
                },
            },
        };
    }

    return {
        content: {
            multiImage: {
                images: mediaIds.map((id) => ({ id })),
            },
        },
    };
}

async function uploadLinkedInMedia(
    accessToken: string,
    personOrOrgId: string,
    mediaPath: string,
    mediaBuffer: Buffer,
    authorType: LinkedInAuthorType
): Promise<string> {
    const isVideo = isMp4Path(mediaPath);
    const isPdf = mediaPath.toLowerCase().includes(".pdf");
    const endpoint = isVideo ? "videos" : isPdf ? "documents" : "images";

    const owner =
        authorType === "personal" ? `urn:li:person:${personOrOrgId}` : `urn:li:organization:${personOrOrgId}`;

    const initRes = await fetch(`https://api.linkedin.com/rest/${endpoint}?action=initializeUpload`, {
        method: "POST",
        headers: {
            ...linkedinRestHeaders(accessToken),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            initializeUploadRequest: {
                owner,
                ...(isVideo
                    ? {
                          fileSizeBytes: mediaBuffer.length,
                          uploadCaptions: false,
                          uploadThumbnail: false,
                      }
                    : {}),
            },
        }),
    });

    const initJson = (await initRes.json()) as {
        value?: {
            uploadUrl?: string;
            image?: string;
            video?: string;
            document?: string;
            uploadInstructions?: Array<{ uploadUrl?: string }>;
        };
        message?: string;
    };

    if (!initRes.ok) {
        throw new Error(initJson.message ?? `LinkedIn ${endpoint} initializeUpload failed (HTTP ${initRes.status})`);
    }

    const value = initJson.value ?? {};
    const sendUrlRequest = value.uploadInstructions?.[0]?.uploadUrl ?? value.uploadUrl;
    const finalOutput = value.video ?? value.image ?? value.document;
    if (!sendUrlRequest || !finalOutput) {
        throw new Error(`LinkedIn ${endpoint} initializeUpload returned an incomplete payload`);
    }

    const etags: string[] = [];
    for (let i = 0; i < mediaBuffer.length; i += CHUNK_BYTES) {
        const chunk = mediaBuffer.subarray(i, i + CHUNK_BYTES);
        const uploadRes = await fetch(sendUrlRequest, {
            method: "PUT",
            headers: {
                ...linkedinRestHeaders(accessToken),
                ...(isVideo
                    ? { "Content-Type": "application/octet-stream" }
                    : isPdf
                      ? { "Content-Type": "application/pdf" }
                      : {}),
            },
            body: new Uint8Array(chunk),
        });
        const etag = uploadRes.headers.get("etag");
        if (etag) etags.push(etag);
    }

    if (isVideo) {
        const finalizeRes = await fetch("https://api.linkedin.com/rest/videos?action=finalizeUpload", {
            method: "POST",
            headers: {
                ...linkedinRestHeaders(accessToken),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                finalizeUploadRequest: {
                    video: value.video,
                    uploadToken: "",
                    uploadedPartIds: etags,
                },
            }),
        });
        if (!finalizeRes.ok) {
            const finalizeJson = (await finalizeRes.json().catch(() => ({}))) as { message?: string };
            throw new Error(finalizeJson.message ?? "LinkedIn video finalizeUpload failed");
        }
    }

    return finalOutput;
}

async function prepareMediaBuffer(mediaPath: string): Promise<Buffer> {
    if (isMp4Path(mediaPath)) {
        return loadMediaBuffer(mediaPath);
    }

    const sharp = (await import("sharp")).default;
    const raw = await loadMediaBuffer(mediaPath);
    const ext = mediaExtFromUrlOrKey(mediaPath);
    return sharp(raw, { animated: ext === "gif" }).jpeg().resize({ width: 1000 }).toBuffer();
}

async function convertImagesToPdfCarousel(media: MediaItem[]): Promise<Buffer> {
    const sharp = (await import("sharp")).default;
    const imageToPDF = (await import("image-to-pdf")).default;

    const images = await Promise.all(
        media.map(async (item) => {
            const raw = await loadMediaBuffer(item.path);
            const image = sharp(raw, { animated: false }).jpeg();
            const { width, height } = await image.metadata();
            const buffer = await image.toBuffer();
            return { buffer, width: width ?? 0, height: height ?? 0 };
        })
    );

    const largest = images.reduce((max, img) =>
        img.width * img.height > max.width * max.height ? img : max
    );

    const pdfStream = imageToPDF(
        images.map((img) => img.buffer),
        [largest.width, largest.height]
    );

    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

async function processMediaForPost(
    postDetails: PostDetails,
    accessToken: string,
    authorId: string,
    authorType: LinkedInAuthorType
): Promise<string[]> {
    const settings = resolveLinkedInSettings(postDetails.settings);
    let media = extractMedia(postDetails.settings);

    if (settings.post_as_images_carousel) {
        if (media.length >= 2) {
            const pdfBuffer = await convertImagesToPdfCarousel(media);
            return [
                await uploadLinkedInMedia(accessToken, authorId, "carousel.pdf", pdfBuffer, authorType),
            ];
        }
    }

    const uploaded: string[] = [];
    for (const item of media) {
        const buffer = await prepareMediaBuffer(item.path);
        uploaded.push(await uploadLinkedInMedia(accessToken, authorId, item.path, buffer, authorType));
    }
    return uploaded;
}

function createLinkedInPostPayload(
    authorId: string,
    authorType: LinkedInAuthorType,
    message: string,
    mediaIds: string[],
    isPdf: boolean,
    pdfTitle?: string
): Record<string, unknown> {
    const author =
        authorType === "personal" ? `urn:li:person:${authorId}` : `urn:li:organization:${authorId}`;

    return {
        author,
        commentary: fixLinkedInCommentary(message),
        visibility: "PUBLIC",
        distribution: {
            feedDistribution: "MAIN_FEED",
            targetEntities: [] as string[],
            thirdPartyDistributionChannels: [] as string[],
        },
        ...buildPostContent(isPdf, mediaIds, pdfTitle),
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
    };
}

/** Publish a LinkedIn feed post (personal profile or company page). */
export async function publishLinkedInPost(
    authorId: string,
    accessToken: string,
    postDetails: PostDetails,
    authorType: LinkedInAuthorType
): Promise<PostResponse> {
    const message = htmlToPlainText(postDetails.message ?? "").trim();
    const settings = resolveLinkedInSettings(postDetails.settings);
    const mediaIds = await processMediaForPost(postDetails, accessToken, authorId, authorType);
    const isPdf = Boolean(settings.post_as_images_carousel && mediaIds.length === 1);
    const pdfTitle = isPdf ? settings.carousel_name || "slides" : undefined;

    const payload = createLinkedInPostPayload(
        authorId,
        authorType,
        message,
        mediaIds,
        isPdf,
        pdfTitle
    );

    const res = await fetch("https://api.linkedin.com/rest/posts", {
        method: "POST",
        headers: {
            ...linkedinRestHeaders(accessToken),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (res.status !== 201 && res.status !== 200) {
        const errJson = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(errJson.message ?? `LinkedIn post failed (HTTP ${res.status})`);
    }

    const postId = res.headers.get("x-restli-id") ?? "";
    return {
        id: postDetails.id,
        postId,
        status: "posted",
        releaseURL: `https://www.linkedin.com/feed/update/${postId}`,
    };
}

/** Publish a text comment on an existing LinkedIn post. */
export async function publishLinkedInComment(
    authorId: string,
    accessToken: string,
    parentPostId: string,
    postDetails: PostDetails,
    authorType: LinkedInAuthorType
): Promise<PostResponse> {
    const message = htmlToPlainText(postDetails.message ?? "").trim();
    const actor =
        authorType === "personal" ? `urn:li:person:${authorId}` : `urn:li:organization:${authorId}`;

    const res = await fetch(
        `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(parentPostId)}/comments`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                actor,
                object: parentPostId,
                message: { text: fixLinkedInCommentary(message) },
            }),
        }
    );

    const json = (await res.json()) as { object?: string; message?: string };
    if (!res.ok) {
        throw new Error(json.message ?? `LinkedIn comment failed (HTTP ${res.status})`);
    }

    const commentId = json.object ?? "";
    return {
        id: postDetails.id,
        postId: commentId,
        status: "posted",
        releaseURL: `https://www.linkedin.com/embed/feed/update/${commentId}`,
    };
}
