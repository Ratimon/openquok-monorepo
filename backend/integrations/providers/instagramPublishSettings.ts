/** Normalized Instagram publish options for Content Publishing API calls. */
export type InstagramGraduationStrategy = "MANUAL" | "SS_PERFORMANCE";

export type InstagramResolvedPublishSettings = {
    post_type: "post" | "story";
    is_trial_reel: boolean;
    graduation_strategy: InstagramGraduationStrategy;
    collaborators: Array<{ label: string }>;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Accepts API `{ label }`, web `string[]`, or comma-separated legacy string. */
export function normalizeInstagramCollaborators(raw: unknown): Array<{ label: string }> {
    if (typeof raw === "string") {
        raw = raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (!Array.isArray(raw)) return [];

    const out: Array<{ label: string }> = [];
    for (const item of raw) {
        if (typeof item === "string") {
            const label = item.replace(/^@/, "").trim();
            if (label) out.push({ label });
            continue;
        }
        if (isPlainObject(item) && typeof item.label === "string") {
            const label = item.label.replace(/^@/, "").trim();
            if (label) out.push({ label });
        }
    }
    return out.slice(0, 3);
}

function readPostType(source: Record<string, unknown>): "post" | "story" {
    if (source.postType === "story" || source.post_type === "story") return "story";
    return "post";
}

function readTrialReel(source: Record<string, unknown>): boolean {
    if (source.trialReel === true || source.is_trial_reel === true) return true;
    return false;
}

function readGraduationStrategy(source: Record<string, unknown>): InstagramGraduationStrategy {
    const g = source.graduationStrategy ?? source.graduation_strategy;
    return g === "SS_PERFORMANCE" ? "SS_PERFORMANCE" : "MANUAL";
}

const DEFAULT_SETTINGS: InstagramResolvedPublishSettings = {
    post_type: "post",
    is_trial_reel: false,
    graduation_strategy: "MANUAL",
    collaborators: [],
};

/**
 * Resolves Instagram publish settings from a scheduled post's `PostDetails.settings`.
 *
 * Accepts:
 * - Public API flat keys on `settings.providerSettings` (`post_type`, `is_trial_reel`, …)
 * - Web composer nested bucket `settings.providerSettings.instagram` (`postType`, `trialReel`, …)
 * - Legacy flat keys on the settings root (direct API / tests)
 */
export function resolveInstagramPublishSettings(postDetailsSettings: unknown): InstagramResolvedPublishSettings {
    if (!isPlainObject(postDetailsSettings)) {
        return { ...DEFAULT_SETTINGS };
    }

    let source: Record<string, unknown> = { ...postDetailsSettings };

    const providerSettings = postDetailsSettings.providerSettings;
    if (isPlainObject(providerSettings)) {
        const { instagram: instagramBucket, ...flatProviderSettings } = providerSettings;
        source = { ...source, ...flatProviderSettings };
        if (isPlainObject(instagramBucket)) {
            source = { ...source, ...instagramBucket };
        }
    } else if (isPlainObject(postDetailsSettings.instagram)) {
        source = { ...source, ...postDetailsSettings.instagram };
    }

    return {
        post_type: readPostType(source),
        is_trial_reel: readTrialReel(source),
        graduation_strategy: readGraduationStrategy(source),
        collaborators: normalizeInstagramCollaborators(source.collaborators),
    };
}
