import type { SendTweetV2Params } from "twitter-api-v2";

import twitterText from "twitter-text";

import { htmlToPlainText } from "../../../utils/content/htmlToPlain";
import type { XReplySettings } from "./xCommon";

export type XResolvedSettings = {
    who_can_reply?: XReplySettings;
    community_id?: string;
    made_with_ai?: boolean;
    paid_partnership?: boolean;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(source: Record<string, unknown>, key: string): string | undefined {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    return undefined;
}

function readBoolean(source: Record<string, unknown>, key: string): boolean | undefined {
    const value = source[key];
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return undefined;
}

const REPLY_SETTING_VALUES = new Set<XReplySettings>([
    "following",
    "mentionedUsers",
    "subscribers",
    "verified",
]);

function normalizeReplySetting(raw: string | undefined): XReplySettings | undefined {
    if (!raw) return undefined;
    const normalized = raw.trim() as XReplySettings;
    return REPLY_SETTING_VALUES.has(normalized) ? normalized : undefined;
}

/** Parses community URLs such as `https://x.com/i/communities/123456789`. */
export function parseXCommunityIdFromUrl(url: string): string | undefined {
    const trimmed = url.trim();
    if (!trimmed) return undefined;

    const match = trimmed.match(/\/communities\/(\d+)/i);
    if (match?.[1]) return match[1];

    if (/^\d+$/.test(trimmed)) return trimmed;
    return undefined;
}

function readReplySetting(source: Record<string, unknown>): XReplySettings | undefined {
    return normalizeReplySetting(
        readString(source, "who_can_reply_post") ?? readString(source, "whoCanReplyPost")
    );
}

function readCommunityId(source: Record<string, unknown>): string | undefined {
    const direct = readString(source, "community_id") ?? readString(source, "communityId");
    if (direct) return parseXCommunityIdFromUrl(direct) ?? direct;
    const url = readString(source, "community") ?? readString(source, "community_url");
    if (url) return parseXCommunityIdFromUrl(url);
    return undefined;
}

function mergeResolvedSettings(
    target: XResolvedSettings,
    source: Record<string, unknown>
): XResolvedSettings {
    const who = readReplySetting(source);
    if (who) target.who_can_reply = who;

    const communityId = readCommunityId(source);
    if (communityId) target.community_id = communityId;

    const madeWithAi = readBoolean(source, "made_with_ai") ?? readBoolean(source, "madeWithAi");
    if (typeof madeWithAi === "boolean") target.made_with_ai = madeWithAi;

    const paidPartnership =
        readBoolean(source, "paid_partnership") ?? readBoolean(source, "paidPartnership");
    if (typeof paidPartnership === "boolean") target.paid_partnership = paidPartnership;

    return target;
}

/**
 * Resolves X compose settings from flat CLI keys and nested web bucket
 * (`providerSettings.x.*`).
 */
export function resolveXSettings(settings: unknown): XResolvedSettings {
    if (!isPlainObject(settings)) return {};

    const out: XResolvedSettings = {};
    mergeResolvedSettings(out, settings);

    const providerSettings = settings.providerSettings;
    if (isPlainObject(providerSettings)) {
        mergeResolvedSettings(out, providerSettings);

        const xBucket = providerSettings.x;
        if (isPlainObject(xBucket)) {
            mergeResolvedSettings(out, xBucket);
        }
    }

    const xRoot = settings.x;
    if (isPlainObject(xRoot)) {
        mergeResolvedSettings(out, xRoot);
    }

    return out;
}

export function buildTweetText(message: string, _settings?: XResolvedSettings): string {
    return htmlToPlainText(message ?? "").trim();
}

export function validateTweetWeightedLength(text: string, maxLength: number): void {
    const parsed = twitterText.parseTweet(text);
    if (parsed.weightedLength > maxLength) {
        throw new Error(`Tweet exceeds the ${maxLength} character limit for this account.`);
    }
}

export function buildTweetPayload(
    text: string,
    settings: XResolvedSettings,
    mediaIds: string[],
    replyToTweetId?: string
): SendTweetV2Params {
    const payload: SendTweetV2Params = { text };

    if (mediaIds.length > 0) {
        const ids = mediaIds.slice(0, 4);
        if (ids.length === 1) payload.media = { media_ids: [ids[0]!] };
        else if (ids.length === 2) payload.media = { media_ids: [ids[0]!, ids[1]!] };
        else if (ids.length === 3) payload.media = { media_ids: [ids[0]!, ids[1]!, ids[2]!] };
        else payload.media = { media_ids: [ids[0]!, ids[1]!, ids[2]!, ids[3]!] };
    }

    if (settings.who_can_reply) {
        payload.reply_settings = settings.who_can_reply;
    }

    if (settings.community_id) {
        payload.community_id = settings.community_id;
    }

    if (replyToTweetId?.trim()) {
        payload.reply = { in_reply_to_tweet_id: replyToTweetId.trim() };
    }

    if (settings.made_with_ai === true) {
        (payload as Record<string, unknown>).content_disclosure = {
            made_with_ai: true,
            ...(settings.paid_partnership === true ? { paid_partnership: true } : {}),
        };
    } else if (settings.paid_partnership === true) {
        (payload as Record<string, unknown>).content_disclosure = { paid_partnership: true };
    }

    return payload;
}
