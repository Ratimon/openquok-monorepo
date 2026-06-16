function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type TiktokPrivacyLevel =
    | "PUBLIC_TO_EVERYONE"
    | "MUTUAL_FOLLOW_FRIENDS"
    | "FOLLOWER_OF_CREATOR"
    | "SELF_ONLY";

export type TiktokContentPostingMethod = "DIRECT_POST" | "UPLOAD";

export type TiktokResolvedPublishSettings = {
    privacy_level: TiktokPrivacyLevel;
    content_posting_method: TiktokContentPostingMethod;
    title: string;
    duet: boolean;
    stitch: boolean;
    comment: boolean;
    autoAddMusic: boolean;
    brand_content_toggle: boolean;
    brand_organic_toggle: boolean;
    video_made_with_ai: boolean;
};

const DEFAULT_PRIVACY: TiktokPrivacyLevel = "PUBLIC_TO_EVERYONE";
const DEFAULT_POSTING_METHOD: TiktokContentPostingMethod = "DIRECT_POST";

function readPrivacyLevel(source: Record<string, unknown>): TiktokPrivacyLevel {
    const raw = source.privacy_level ?? source.privacyLevel;
    if (
        raw === "PUBLIC_TO_EVERYONE" ||
        raw === "MUTUAL_FOLLOW_FRIENDS" ||
        raw === "FOLLOWER_OF_CREATOR" ||
        raw === "SELF_ONLY"
    ) {
        return raw;
    }
    return DEFAULT_PRIVACY;
}

function readPostingMethod(source: Record<string, unknown>): TiktokContentPostingMethod {
    const raw = source.content_posting_method ?? source.contentPostingMethod;
    if (raw === "UPLOAD" || raw === "MEDIA_UPLOAD") return "UPLOAD";
    if (raw === "DIRECT_POST") return "DIRECT_POST";
    return DEFAULT_POSTING_METHOD;
}

function readBool(source: Record<string, unknown>, ...keys: string[]): boolean {
    for (const key of keys) {
        const raw = source[key];
        if (raw === true || raw === "true" || raw === "yes" || raw === 1 || raw === "1") return true;
        if (raw === false || raw === "false" || raw === "no" || raw === 0 || raw === "0") return false;
    }
    return false;
}

function readAllowToggle(source: Record<string, unknown>, allowKey: string, disableKey: string, defaultAllow: boolean): boolean {
    if (allowKey in source) return readBool(source, allowKey);
    if (disableKey in source) return !readBool(source, disableKey);
    return defaultAllow;
}

function readTitle(source: Record<string, unknown>): string {
    const title = source.title;
    return typeof title === "string" ? title.trim().slice(0, 90) : "";
}

/**
 * Resolves TikTok publish settings from scheduled post `PostDetails.settings`.
 *
 * Accepts flat CLI keys on `settings.providerSettings` and nested `settings.providerSettings.tiktok`
 * (web composer bucket). Legacy flat `settings.tiktok` is also supported.
 */
export function resolveTiktokSettings(postDetailsSettings: unknown, message = ""): TiktokResolvedPublishSettings {
    const caption = typeof message === "string" ? message.trim() : "";

    if (!isPlainObject(postDetailsSettings)) {
        return {
            privacy_level: DEFAULT_PRIVACY,
            content_posting_method: DEFAULT_POSTING_METHOD,
            title: caption.slice(0, 90),
            duet: true,
            stitch: true,
            comment: true,
            autoAddMusic: false,
            brand_content_toggle: false,
            brand_organic_toggle: false,
            video_made_with_ai: false,
        };
    }

    let source: Record<string, unknown> = { ...postDetailsSettings };

    const providerSettings = postDetailsSettings.providerSettings;
    if (isPlainObject(providerSettings)) {
        const { tiktok: tiktokBucket, ...flatProviderSettings } = providerSettings;
        source = { ...source, ...flatProviderSettings };
        if (isPlainObject(tiktokBucket)) {
            source = { ...source, ...tiktokBucket };
        }
    } else if (isPlainObject(postDetailsSettings.tiktok)) {
        source = { ...source, ...postDetailsSettings.tiktok };
    }

    const explicitTitle = readTitle(source);

    return {
        privacy_level: readPrivacyLevel(source),
        content_posting_method: readPostingMethod(source),
        title: explicitTitle || caption.slice(0, 90),
        duet: readAllowToggle(source, "duet", "disable_duet", true),
        stitch: readAllowToggle(source, "stitch", "disable_stitch", true),
        comment: readAllowToggle(source, "comment", "disable_comment", true),
        autoAddMusic: readBool(source, "autoAddMusic", "auto_add_music"),
        brand_content_toggle: readBool(source, "brand_content_toggle", "brandContentToggle"),
        brand_organic_toggle: readBool(source, "brand_organic_toggle", "brandOrganicToggle"),
        video_made_with_ai: readBool(source, "video_made_with_ai", "videoMadeWithAi"),
    };
}
