import { config } from "../../config/GlobalConfig";
import { DATABASE_NAMES } from "../../repositories/StorageSupabaseRepository";

export const AUTO_LAUNCH_PROFILE_MEDIA_BUCKET = DATABASE_NAMES.AUTO_LAUNCH_PROFILE_MEDIA;

const PUBLIC_OBJECT_MARKER = `/object/public/${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}/`;

function encodeStoragePathSegments(storagePath: string): string {
    return storagePath
        .split("/")
        .map((s) => encodeURIComponent(s))
        .join("/");
}

function trimBackendApiBase(): string {
    const backend = String(
        (config.server as { backendDomainUrl?: string })?.backendDomainUrl ?? ""
    ).replace(/\/$/, "");
    const apiPrefix = String((config.api as { prefix?: string })?.prefix ?? "/api/v1").replace(/\/$/, "");
    return `${backend}${apiPrefix}`;
}

/**
 * Derives the storage object key for `auto_launch_profile_media` from a URL or bare key.
 */
export function extractAutoLaunchProfileMediaStoragePathFromImageSrc(src: string): string | null {
    const trimmed = src.trim();
    if (!trimmed || trimmed.startsWith("blob:")) return null;

    let i = trimmed.indexOf(PUBLIC_OBJECT_MARKER);
    if (i !== -1) {
        const rest = trimmed.slice(i + PUBLIC_OBJECT_MARKER.length).split(/[?#]/)[0];
        return rest ? decodeURIComponent(rest) : null;
    }

    try {
        const u = new URL(trimmed, "https://example.com");
        if (u.searchParams.get("databaseName") === AUTO_LAUNCH_PROFILE_MEDIA_BUCKET) {
            const imageUrl = u.searchParams.get("imageUrl");
            if (imageUrl) return decodeURIComponent(imageUrl);
        }
        const path = u.pathname;
        i = path.indexOf(PUBLIC_OBJECT_MARKER);
        if (i !== -1) {
            const rest = path.slice(i + PUBLIC_OBJECT_MARKER.length).split(/[?#]/)[0];
            return rest ? decodeURIComponent(rest) : null;
        }
    } catch {
        /* ignore */
    }

    if (trimmed.includes(`databaseName=${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}`)) {
        try {
            const q = trimmed.includes("?") ? trimmed.split("?")[1] ?? "" : "";
            const params = new URLSearchParams(q);
            if (params.get("databaseName") === AUTO_LAUNCH_PROFILE_MEDIA_BUCKET) {
                const imageUrl = params.get("imageUrl");
                if (imageUrl) return decodeURIComponent(imageUrl);
            }
        } catch {
            /* ignore */
        }
    }

    return null;
}

/**
 * Normalizes logo/gallery fields to a bare `auto_launch_profile_media` object key
 * (e.g. `{orgId}/{profileId}/0.123.webp`), accepting legacy public URLs or bucket prefixes.
 */
export function resolveAutoLaunchProfileMediaStorageKey(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;

    const fromUrl = extractAutoLaunchProfileMediaStoragePathFromImageSrc(trimmed);
    if (fromUrl) return fromUrl.replace(/^\/+/, "");

    let key = trimmed.replace(/^\/+/, "");
    if (key.startsWith(`${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}/`)) {
        key = key.slice(AUTO_LAUNCH_PROFILE_MEDIA_BUCKET.length + 1);
    }
    if (key.includes("://")) return null;
    if (!key) return null;
    return key;
}

/**
 * Builds an absolute HTTPS URL for extension fill and submission snapshots.
 * Prefers Supabase public object URLs when `PUBLIC_SUPABASE_URL` is configured.
 */
export function buildAutoLaunchProfileMediaPublicUrl(storagePath: string): string {
    const key = resolveAutoLaunchProfileMediaStorageKey(storagePath);
    if (!key) return "";

    const supabasePublic = String(
        (config.supabase as { supabaseUrl?: string })?.supabaseUrl ?? ""
    ).replace(/\/$/, "");
    if (supabasePublic) {
        return `${supabasePublic}/storage/v1/object/public/${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}/${encodeStoragePathSegments(key)}`;
    }

    const apiBase = trimBackendApiBase();
    return `${apiBase}/image/download?databaseName=${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}&imageUrl=${encodeURIComponent(key)}`;
}

/** Resolves a stored path to a public URL; passes through existing `http(s)` values. */
export function resolveAutoLaunchProfileImageUrl(raw: string | null | undefined): string | null {
    const trimmed = raw?.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const built = buildAutoLaunchProfileMediaPublicUrl(trimmed);
    return built.trim() ? built : null;
}

/** `{organizationId}/{profileId}` prefix for uploads into `auto_launch_profile_media`. */
export function parseAutoLaunchProfileMediaUploadPrefix(raw: string): {
    organizationId: string;
    profileId: string;
} | null {
    const trimmed = raw.trim().replace(/^\/+|\/+$/g, "");
    const match = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(
        trimmed
    );
    if (!match) return null;
    return { organizationId: match[1], profileId: match[2] };
}
