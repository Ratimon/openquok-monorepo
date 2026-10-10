import type { SocialPostLike } from "backend/utils/dtos/PostDTO.js";

/**
 * `posts.settings` / `posts.image` are json/jsonb. PostgREST + the Supabase JS client often return them as
 * parsed objects; some paths still use stringified JSON.
 */
export function parsePostsJsonColumn(raw: unknown): unknown {
    if (raw == null) return null;
    if (typeof raw === "string") {
        const t = raw.trim();
        if (!t) return null;
        try {
            return JSON.parse(t) as unknown;
        } catch {
            return null;
        }
    }
    return raw;
}

export function parseProviderSettingsFromPostRow(row: SocialPostLike): Record<string, unknown> | null {
    const o = parsePostsJsonColumn(row.settings as unknown);
    if (!o || typeof o !== "object" || Array.isArray(o)) return null;
    const providerSettings = (o as { providerSettings?: unknown }).providerSettings;
    if (!providerSettings || typeof providerSettings !== "object" || Array.isArray(providerSettings)) {
        return null;
    }
    return providerSettings as Record<string, unknown>;
}
