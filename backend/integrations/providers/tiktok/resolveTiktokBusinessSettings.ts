import {
    resolveTiktokSettings,
    type TiktokContentPostingMethod,
    type TiktokPrivacyLevel,
    type TiktokResolvedPublishSettings,
} from "./resolveTiktokSettings";

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type TiktokBusinessMusicSoundInfo = {
    music_sound_id: string;
    music_sound_volume?: number;
    music_sound_start?: number;
    music_sound_end?: number;
    video_original_sound_volume?: number;
};

export type TiktokBusinessResolvedPublishSettings = TiktokResolvedPublishSettings & {
    musicSoundInfo?: TiktokBusinessMusicSoundInfo;
    /** POI / location id for DIRECT_POST when supported by the account. */
    poiId?: string;
};

function readString(source: Record<string, unknown>, ...keys: string[]): string | undefined {
    for (const key of keys) {
        const raw = source[key];
        if (typeof raw === "string" && raw.trim()) return raw.trim();
    }
    return undefined;
}

function readOptionalNumber(source: Record<string, unknown>, key: string): number | undefined {
    const raw = source[key];
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
}

function readMusicSoundInfo(source: Record<string, unknown>): TiktokBusinessMusicSoundInfo | undefined {
    const nested =
        source.music_sound_info && isPlainObject(source.music_sound_info)
            ? (source.music_sound_info as Record<string, unknown>)
            : source.musicSoundInfo && isPlainObject(source.musicSoundInfo)
              ? (source.musicSoundInfo as Record<string, unknown>)
              : null;

    const musicSoundId =
        readString(source, "music_sound_id", "musicSoundId") ??
        (nested ? readString(nested, "music_sound_id", "musicSoundId") : undefined);
    if (!musicSoundId) return undefined;

    const volumeSource = nested ?? source;
    const info: TiktokBusinessMusicSoundInfo = { music_sound_id: musicSoundId };
    const musicSoundVolume = readOptionalNumber(volumeSource, "music_sound_volume");
    const musicSoundStart = readOptionalNumber(volumeSource, "music_sound_start");
    const musicSoundEnd = readOptionalNumber(volumeSource, "music_sound_end");
    const videoOriginalSoundVolume = readOptionalNumber(volumeSource, "video_original_sound_volume");
    if (musicSoundVolume !== undefined) info.music_sound_volume = musicSoundVolume;
    if (musicSoundStart !== undefined) info.music_sound_start = musicSoundStart;
    if (musicSoundEnd !== undefined) info.music_sound_end = musicSoundEnd;
    if (videoOriginalSoundVolume !== undefined) {
        info.video_original_sound_volume = videoOriginalSoundVolume;
    }
    return info;
}

function mergeBusinessBucket(postDetailsSettings: unknown): Record<string, unknown> {
    if (!isPlainObject(postDetailsSettings)) return {};
    const providerSettings = postDetailsSettings.providerSettings;
    if (!isPlainObject(providerSettings)) return {};

    const { "tiktok-business": businessBucket, tiktokBusiness, ...flatProviderSettings } = providerSettings;
    let merged: Record<string, unknown> = { ...flatProviderSettings };
    const bucket = isPlainObject(businessBucket)
        ? businessBucket
        : isPlainObject(tiktokBusiness)
          ? tiktokBusiness
          : null;
    if (bucket) merged = { ...merged, ...bucket };
    return merged;
}

/**
 * Resolves TikTok Business publish settings from scheduled post `PostDetails.settings`.
 *
 * Shared TikTok keys are resolved via {@link resolveTiktokSettings}; Business-only keys
 * (`music_sound_id`, `poi_id`) are read from flat providerSettings and the `tiktok-business` bucket.
 */
export function resolveTiktokBusinessSettings(
    postDetailsSettings: unknown,
    message = ""
): TiktokBusinessResolvedPublishSettings {
    const base = resolveTiktokSettings(postDetailsSettings, message);
    const businessSource = mergeBusinessBucket(postDetailsSettings);

    const musicSoundInfo = readMusicSoundInfo(businessSource);
    const poiId = readString(businessSource, "poi_id", "poiId", "location_id", "locationId");

    return {
        ...base,
        ...(musicSoundInfo ? { musicSoundInfo } : {}),
        ...(poiId ? { poiId } : {}),
    };
}

export type { TiktokContentPostingMethod, TiktokPrivacyLevel };
