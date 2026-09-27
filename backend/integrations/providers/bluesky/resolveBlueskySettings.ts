function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type BlueskyThreadGateSetting = "everyone" | "mentioned" | "following" | "followers" | "nobody";

export type BlueskyResolvedPublishSettings = {
    linkUrl?: string;
    linkTitle?: string;
    linkDescription?: string;
    quoteUrl?: string;
    threadGate: BlueskyThreadGateSetting;
};

const THREAD_GATE_VALUES: BlueskyThreadGateSetting[] = [
    "everyone",
    "mentioned",
    "following",
    "followers",
    "nobody",
];

const BSKY_APP_POST_URL =
    /^https:\/\/bsky\.app\/profile\/([^/?#]+)\/post\/([^/?#]+)(?:[/?#]|$)/i;

function readTrimmedString(source: Record<string, unknown>, key: string): string | undefined {
    const raw = source[key];
    if (typeof raw !== "string") return undefined;
    const trimmed = raw.trim();
    return trimmed || undefined;
}

function readThreadGate(source: Record<string, unknown>): BlueskyThreadGateSetting {
    const raw = source.threadGate ?? source.thread_gate;
    if (typeof raw === "string") {
        const normalized = raw.trim().toLowerCase();
        if (THREAD_GATE_VALUES.includes(normalized as BlueskyThreadGateSetting)) {
            return normalized as BlueskyThreadGateSetting;
        }
    }
    return "everyone";
}

export function resolveBlueskySettings(postDetailsSettings: unknown): BlueskyResolvedPublishSettings {
    if (!isPlainObject(postDetailsSettings)) {
        return { threadGate: "everyone" };
    }

    let source: Record<string, unknown> = { ...postDetailsSettings };
    const providerSettings = postDetailsSettings.providerSettings;
    if (isPlainObject(providerSettings)) {
        const { bluesky: blueskyBucket, ...flatProviderSettings } = providerSettings;
        source = { ...source, ...flatProviderSettings };
        if (isPlainObject(blueskyBucket)) {
            source = { ...source, ...blueskyBucket };
        }
    } else if (isPlainObject(postDetailsSettings.bluesky)) {
        source = { ...source, ...postDetailsSettings.bluesky };
    }

    const linkUrl = readTrimmedString(source, "linkUrl") ?? readTrimmedString(source, "link_url");
    const linkTitle = readTrimmedString(source, "linkTitle") ?? readTrimmedString(source, "link_title");
    const linkDescription =
        readTrimmedString(source, "linkDescription") ?? readTrimmedString(source, "link_description");
    const quoteUrl = readTrimmedString(source, "quoteUrl") ?? readTrimmedString(source, "quote_url");
    const threadGate = readThreadGate(source);

    return {
        ...(linkUrl ? { linkUrl } : {}),
        ...(linkTitle ? { linkTitle } : {}),
        ...(linkDescription ? { linkDescription } : {}),
        ...(quoteUrl ? { quoteUrl } : {}),
        threadGate,
    };
}

export function isValidHttpUrl(value: string): boolean {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

/** Parses a bsky.app post URL into actor handle/DID and record key. */
export function parseBlueskyAppPostUrl(url: string): { actor: string; rkey: string } | null {
    const trimmed = url.trim();
    const match = trimmed.match(BSKY_APP_POST_URL);
    if (!match?.[1] || !match[2]) return null;
    try {
        return {
            actor: decodeURIComponent(match[1]),
            rkey: decodeURIComponent(match[2]),
        };
    } catch {
        return null;
    }
}

export function isBlueskyQuoteTarget(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith("at://")) return true;
    return parseBlueskyAppPostUrl(trimmed) !== null;
}

export type BlueskyMediaItemLike = { path: string };

/**
 * Validates Bluesky settings against attached media. Returns an error message or null when valid.
 */
export function validateBlueskySettingsForMedia(
    settings: BlueskyResolvedPublishSettings,
    media: BlueskyMediaItemLike[]
): string | null {
    const hasMedia = media.length > 0;
    const hasLink = !!settings.linkUrl;
    const hasQuote = !!settings.quoteUrl;

    if (hasLink && !isValidHttpUrl(settings.linkUrl!)) {
        return "Bluesky link URL must be a valid http(s) URL.";
    }
    if (hasQuote && !isBlueskyQuoteTarget(settings.quoteUrl!)) {
        return "Bluesky quote URL must be a bsky.app post link or an AT Protocol URI.";
    }
    if (hasLink && hasQuote) {
        return "Bluesky posts cannot include both a link card and a quote at the same time.";
    }
    if (hasMedia && hasLink) {
        return "Bluesky link cards are only supported on text-only posts without media.";
    }
    if (hasMedia && hasQuote) {
        return "Bluesky quote posts cannot include image or video attachments.";
    }
    return null;
}
