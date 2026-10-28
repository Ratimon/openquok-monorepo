import {
    formatRedditCommunityInput,
    redditCommunityValidationError,
} from "openquok-common";
import { REDDIT_MAX_LENGTH, REDDIT_TITLE_MAX_LENGTH } from "./redditOAuth";

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const REDDIT_TITLE_MIN_LENGTH = 1;

/** @deprecated Use REDDIT_COMMUNITY_SLUG_MAX_LENGTH from openquok-common */
export const REDDIT_SUBREDDIT_MAX_LENGTH = 21;

export type RedditResolvedPublishSettings = {
    subreddit: string;
    title: string;
};

function readString(source: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return "";
}

function normalizeCommunity(raw: string): string {
    return formatRedditCommunityInput(raw);
}

export function validateRedditSubredditSlug(subreddit: string): string | null {
    const canonical = normalizeCommunity(subreddit);
    if (!canonical) return "Reddit posts require a community (r/name) or profile (u/name)";
    const validation = redditCommunityValidationError(canonical);
    if (validation) return validation;
    return null;
}

/** True when per-channel Settings fields are in use (strict validation applies). */
export function redditPerChannelSettingsActive(resolved: RedditResolvedPublishSettings): boolean {
    if (resolved.subreddit) return true;
    if (resolved.title) return true;
    return false;
}

/**
 * Resolves Reddit publish settings from scheduled post `PostDetails.settings`.
 *
 * Accepts flat CLI keys on `settings.providerSettings` and nested `settings.providerSettings.reddit`.
 *
 * `subreddit` and `title` are optional in the JSON schema for global copy-only posts; when any
 * per-channel field is present, `validateCreatePost` enforces community and title rules.
 * Post body and inline links come from the composer caption (text posts only).
 */
export function resolveRedditSettings(postDetailsSettings: unknown): RedditResolvedPublishSettings {
    if (!isPlainObject(postDetailsSettings)) {
        return { subreddit: "", title: "" };
    }

    let source: Record<string, unknown> = { ...postDetailsSettings };

    const providerSettings = postDetailsSettings.providerSettings;
    if (isPlainObject(providerSettings)) {
        const { reddit: redditBucket, ...flatProviderSettings } = providerSettings;
        source = { ...source, ...flatProviderSettings };
        if (isPlainObject(redditBucket)) {
            source = { ...source, ...redditBucket };
        }
    } else if (isPlainObject(postDetailsSettings.reddit)) {
        source = { ...source, ...postDetailsSettings.reddit };
    }

    const subreddit = normalizeCommunity(readString(source, "subreddit", "community", "sub"));
    const title = readString(source, "title");

    return {
        subreddit,
        title,
    };
}

export const REDDIT_SETTINGS_SCHEMA = {
    type: "object",
    required: [] as string[],
    properties: {
        subreddit: {
            type: "string",
            description: "Target community or profile as r/name or u/name (bare name defaults to r/)",
        },
        title: {
            type: "string",
            minLength: REDDIT_TITLE_MIN_LENGTH,
            maxLength: REDDIT_TITLE_MAX_LENGTH,
            description: "Post title on reddit.com; body and links come from the composer caption",
        },
    },
} as const;

export { REDDIT_MAX_LENGTH };
