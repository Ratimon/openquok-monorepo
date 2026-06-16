import type { PostDetails } from "../social.integrations.interface";
import { UploadFactory } from "../../connections/upload/upload.factory";
import { storageR2Repository } from "../../repositories/index";
import { mediaExtFromUrlOrKey } from "../providers/tiktok/tiktokPublishValidation";

type MediaItem = { path: string; bucket?: string };
type SettingsWithMedia = { media?: { items?: MediaItem[] } };

function isPngMediaPath(path: string): boolean {
    return mediaExtFromUrlOrKey(path) === "png";
}

async function loadMediaBuffer(path: string): Promise<Buffer> {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        const res = await fetch(path);
        if (!res.ok) {
            throw new Error(`Failed to download media for JPEG conversion (HTTP ${res.status})`);
        }
        return Buffer.from(await res.arrayBuffer());
    }
    const upload = UploadFactory.createStorage(storageR2Repository);
    const { buffer } = await upload.downloadObject(path);
    return buffer;
}

/**
 * When a provider sets `convertToJPEG`, convert PNG image attachments to JPEG and
 * re-upload so PULL_FROM_URL targets a TikTok-compatible format.
 */
export async function convertPostMediaPngToJpeg(
    postDetails: PostDetails,
    organizationId: string
): Promise<PostDetails> {
    const settings = postDetails.settings;
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
        return postDetails;
    }

    const media = (settings as SettingsWithMedia).media;
    const items = media?.items;
    if (!Array.isArray(items) || items.length === 0) {
        return postDetails;
    }

    const sharp = (await import("sharp")).default;
    const upload = UploadFactory.createStorage(storageR2Repository);
    const newItems: MediaItem[] = [...items];
    let changed = false;

    for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        if (!item?.path || !isPngMediaPath(item.path)) continue;

        const inputBuffer = await loadMediaBuffer(item.path);
        const jpegBuffer = await sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
        const uploaded = await upload.uploadFile({
            organizationId,
            buffer: jpegBuffer,
            originalName: "converted.jpg",
            contentType: "image/jpeg",
        });
        newItems[i] = { ...item, path: uploaded.path };
        changed = true;
    }

    if (!changed) return postDetails;

    return {
        ...postDetails,
        settings: {
            ...(settings as Record<string, unknown>),
            media: { items: newItems },
        },
    };
}
