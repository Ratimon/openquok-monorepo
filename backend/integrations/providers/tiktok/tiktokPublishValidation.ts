import { publicUrlForObjectKey } from "../../../repositories/MediaRepository";

export type TiktokMediaItem = { path: string; bucket?: string };
type SettingsWithMedia = { media?: { items?: TiktokMediaItem[] } | TiktokMediaItem[] };

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mediaExtFromUrlOrKey(path: string): string {
    const raw = String(path || "").trim();
    if (!raw) return "";
    try {
        const u = new URL(raw);
        return (u.pathname.split(".").pop() ?? "").toLowerCase();
    } catch {
        return (raw.split("?")[0]?.split("#")[0]?.split(".").pop() ?? "").toLowerCase();
    }
}

export function extractTiktokMediaFromSettings(settings: unknown): TiktokMediaItem[] {
    if (!isPlainObject(settings)) return [];
    const media = (settings as SettingsWithMedia).media;
    if (Array.isArray(media)) {
        return media.filter((m): m is TiktokMediaItem => !!m && typeof m.path === "string" && m.path.length > 0);
    }
    const items = media?.items;
    if (Array.isArray(items)) {
        return items.filter((m): m is TiktokMediaItem => !!m && typeof m.path === "string" && m.path.length > 0);
    }
    return [];
}

export function resolveTiktokPublicMediaUrl(path: string): string {
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
            "Cannot build a public media URL for TikTok (set STORAGE_R2_PUBLIC_BASE_URL for R2, STORAGE_PROVIDER=local with FRONTEND_DOMAIN_URL, or use full https:// URLs)"
        );
    }
    return url;
}

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const VIDEO_EXTENSIONS = new Set(["mp4"]);

export function classifyTiktokMedia(media: TiktokMediaItem[]): "video" | "photo" | null {
    if (media.length === 0) return null;
    const exts = media.map((m) => mediaExtFromUrlOrKey(m.path));
    const hasVideo = exts.some((ext) => VIDEO_EXTENSIONS.has(ext));
    const hasImage = exts.some((ext) => IMAGE_EXTENSIONS.has(ext));
    if (hasVideo && hasImage) return null;
    if (hasVideo) return media.length === 1 ? "video" : null;
    if (hasImage) return "photo";
    return null;
}

export function validateTiktokMedia(media: TiktokMediaItem[]): { kind: "video" | "photo"; urls: string[] } {
    if (media.length === 0) {
        throw new Error("TikTok requires one video or one or more images");
    }

    const kind = classifyTiktokMedia(media);
    if (!kind) {
        const exts = media.map((m) => mediaExtFromUrlOrKey(m.path)).join(", ");
        if (media.length > 1 && media.some((m) => mediaExtFromUrlOrKey(m.path) === "mp4")) {
            throw new Error("TikTok does not support mixing video and images in one post");
        }
        if (media.length > 1 && media.every((m) => mediaExtFromUrlOrKey(m.path) === "mp4")) {
            throw new Error("TikTok requires exactly one MP4 video");
        }
        throw new Error(`TikTok media type is not supported (extensions: ${exts || "unknown"})`);
    }

    if (kind === "video") {
        const ext = mediaExtFromUrlOrKey(media[0]!.path);
        if (ext !== "mp4") {
            throw new Error("TikTok requires an MP4 video attachment");
        }
    } else {
        for (const item of media) {
            const ext = mediaExtFromUrlOrKey(item.path);
            if (!IMAGE_EXTENSIONS.has(ext)) {
                throw new Error("TikTok photo posts require JPEG, PNG, or WEBP images");
            }
        }
        if (media.length > 35) {
            throw new Error("TikTok photo posts support at most 35 images");
        }
    }

    return {
        kind,
        urls: media.map((m) => resolveTiktokPublicMediaUrl(m.path)),
    };
}
