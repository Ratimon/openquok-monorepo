function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type YoutubePrivacyStatus = "public" | "private" | "unlisted";

export type YoutubeTagOption = { value: string; label: string };

export type YoutubeResolvedPublishSettings = {
    title: string;
    description: string;
    privacyStatus: YoutubePrivacyStatus;
    selfDeclaredMadeForKids: boolean;
    tags: string[];
    thumbnailPath?: string;
};

const DEFAULT_PRIVACY: YoutubePrivacyStatus = "public";

function readPrivacyStatus(source: Record<string, unknown>): YoutubePrivacyStatus {
    const raw = source.type ?? source.privacyStatus ?? source.privacy_status;
    if (raw === "private" || raw === "unlisted" || raw === "public") return raw;
    return DEFAULT_PRIVACY;
}

function readMadeForKids(source: Record<string, unknown>): boolean {
    const raw = source.selfDeclaredMadeForKids ?? source.self_declared_made_for_kids;
    if (raw === true || raw === "yes") return true;
    return false;
}

function readTitle(source: Record<string, unknown>): string {
    const title = source.title;
    return typeof title === "string" ? title.trim() : "";
}

function normalizeTags(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    const out: string[] = [];
    for (const item of raw) {
        if (typeof item === "string") {
            const label = item.trim();
            if (label) out.push(label);
            continue;
        }
        if (isPlainObject(item)) {
            const label =
                (typeof item.label === "string" ? item.label : typeof item.value === "string" ? item.value : "").trim();
            if (label) out.push(label);
        }
    }
    return out.slice(0, 500);
}

function readThumbnailPath(source: Record<string, unknown>): string | undefined {
    const thumb = source.thumbnail;
    if (isPlainObject(thumb) && typeof thumb.path === "string" && thumb.path.trim()) {
        return thumb.path.trim();
    }
    if (typeof source.thumbnailPath === "string" && source.thumbnailPath.trim()) {
        return source.thumbnailPath.trim();
    }
    return undefined;
}

/**
 * Resolves YouTube publish settings from scheduled post `PostDetails.settings`.
 *
 * Accepts flat CLI keys on `settings.providerSettings` and nested `settings.providerSettings.youtube`
 * (web composer bucket). Legacy flat `settings.youtube` is also supported.
 */
export function resolveYoutubeSettings(postDetailsSettings: unknown, message = ""): YoutubeResolvedPublishSettings {
    const description = typeof message === "string" ? message : "";

    if (!isPlainObject(postDetailsSettings)) {
        return {
            title: "",
            description,
            privacyStatus: DEFAULT_PRIVACY,
            selfDeclaredMadeForKids: false,
            tags: [],
        };
    }

    let source: Record<string, unknown> = { ...postDetailsSettings };

    const providerSettings = postDetailsSettings.providerSettings;
    if (isPlainObject(providerSettings)) {
        const { youtube: youtubeBucket, ...flatProviderSettings } = providerSettings;
        source = { ...source, ...flatProviderSettings };
        if (isPlainObject(youtubeBucket)) {
            source = { ...source, ...youtubeBucket };
        }
    } else if (isPlainObject(postDetailsSettings.youtube)) {
        source = { ...source, ...postDetailsSettings.youtube };
    }

    return {
        title: readTitle(source),
        description,
        privacyStatus: readPrivacyStatus(source),
        selfDeclaredMadeForKids: readMadeForKids(source),
        tags: normalizeTags(source.tags),
        thumbnailPath: readThumbnailPath(source),
    };
}
