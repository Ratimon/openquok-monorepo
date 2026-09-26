import { mediaExtFromUrlOrKey } from "../tiktok/tiktokPublishValidation";

export type BlueskyMediaItem = { path: string; bucket?: string; alt?: string | null };

type SettingsWithMedia = { media?: { items?: BlueskyMediaItem[] } | BlueskyMediaItem[] };

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const VIDEO_EXTENSIONS = new Set(["mp4"]);

export const BLUESKY_MAX_IMAGES = 4;
export const BLUESKY_MAX_LENGTH = 300;

export function extractBlueskyMediaFromSettings(settings: unknown): BlueskyMediaItem[] {
    if (!settings || typeof settings !== "object") return [];
    const media = (settings as SettingsWithMedia).media;
    if (Array.isArray(media)) {
        return media.filter((m): m is BlueskyMediaItem => !!m && typeof m.path === "string" && m.path.length > 0);
    }
    const items = media?.items;
    if (Array.isArray(items)) {
        return items.filter((m): m is BlueskyMediaItem => !!m && typeof m.path === "string" && m.path.length > 0);
    }
    return [];
}

export type BlueskyMediaKind = "empty" | "images" | "video";

export function classifyBlueskyMedia(media: BlueskyMediaItem[]): BlueskyMediaKind {
    if (media.length === 0) return "empty";
    const exts = media.map((m) => mediaExtFromUrlOrKey(m.path));
    const hasVideo = exts.some((ext) => VIDEO_EXTENSIONS.has(ext));
    const hasImage = exts.some((ext) => IMAGE_EXTENSIONS.has(ext));
    if (hasVideo && hasImage) return "empty";
    if (hasVideo) return media.length === 1 ? "video" : "empty";
    if (hasImage) return media.length <= BLUESKY_MAX_IMAGES ? "images" : "empty";
    return "empty";
}

export function validateBlueskyMediaMix(media: BlueskyMediaItem[]): string | null {
    if (media.length === 0) return null;
    const kind = classifyBlueskyMedia(media);
    if (kind === "images") return null;
    if (kind === "video") return null;
    const exts = media.map((m) => mediaExtFromUrlOrKey(m.path)).join(", ");
    const videoCount = media.filter((m) => mediaExtFromUrlOrKey(m.path) === "mp4").length;
    if (videoCount > 1) {
        return "Bluesky allows one MP4 video or up to four images per post, not multiple videos.";
    }
    if (videoCount === 1 && media.length > 1) {
        return "Bluesky does not support mixing images and video in one post.";
    }
    if (media.length > BLUESKY_MAX_IMAGES) {
        return `Bluesky allows up to ${BLUESKY_MAX_IMAGES} images or one MP4 video per post.`;
    }
    return `Bluesky media type is not supported (extensions: ${exts || "unknown"}).`;
}
