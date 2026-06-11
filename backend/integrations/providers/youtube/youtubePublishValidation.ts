import { publicUrlForObjectKey } from "../../../repositories/MediaRepository";

type MediaItem = { path: string; bucket?: string };
type SettingsWithMedia = { media?: { items?: MediaItem[] } | MediaItem[] };

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mediaExtFromUrlOrKey(path: string): string {
    const raw = String(path || "").trim();
    if (!raw) return "";
    try {
        const u = new URL(raw);
        return (u.pathname.split(".").pop() ?? "").toLowerCase();
    } catch {
        return (raw.split("?")[0]?.split("#")[0]?.split(".").pop() ?? "").toLowerCase();
    }
}

export function extractYoutubeMediaFromSettings(settings: unknown): MediaItem[] {
    if (!isPlainObject(settings)) return [];
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

export function resolveYoutubePublicMediaUrl(path: string): string {
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
            "Cannot build a public media URL for YouTube (set STORAGE_R2_PUBLIC_BASE_URL for R2, or use full https:// URLs)"
        );
    }
    return url;
}

export function validateYoutubeVideoMedia(media: MediaItem[]): void {
    if (media.length !== 1) {
        throw new Error("YouTube requires one video attachment");
    }
    const ext = mediaExtFromUrlOrKey(media[0]!.path);
    if (ext !== "mp4") {
        throw new Error("YouTube requires an MP4 video attachment");
    }
}

export function validateYoutubeTitle(title: string): void {
    const len = title.trim().length;
    if (len < 2) {
        throw new Error("YouTube title must be at least 2 characters");
    }
    if (len > 100) {
        throw new Error("YouTube title must be at most 100 characters");
    }
}
