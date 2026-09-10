import twitterText from "twitter-text";

import type { SocialProvider } from "../../integrations/social.integrations.interface.js";
import { extractFollowUpRepliesFromProviderSettingsObject } from "../dtos/PostDTO.js";
import {
    isVerifiedFromAdditionalSettings,
    parseAdditionalSettings,
} from "../integrations/additionalSettings.js";
import { stripComposerBodyForEditor } from "./stripComposerBodyForEditor.js";

const CROSS_ACCOUNT_PLUG_BUCKETS = ["threads", "x", "linkedin"] as const;

export type CaptionTextWithLabel = {
    text: string;
    label: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function providerCaptionDisplayName(providerIdentifier: string): string {
    const id = providerIdentifier.trim().toLowerCase();
    switch (id) {
        case "threads":
            return "Threads";
        case "x":
            return "X";
        case "linkedin":
            return "LinkedIn";
        case "linkedin-page":
            return "LinkedIn Page";
        case "instagram":
        case "instagram-business":
        case "instagram-standalone":
            return "Instagram";
        case "facebook":
            return "Facebook";
        case "tiktok":
            return "TikTok";
        case "youtube":
            return "YouTube";
        case "devto":
            return "Dev.to";
        default:
            return providerIdentifier.trim() || "Channel";
    }
}

function pushCaptionText(out: CaptionTextWithLabel[], text: unknown, label: string): void {
    if (typeof text !== "string") return;
    if (!text.trim()) return;
    out.push({ text, label });
}

/**
 * Caption length after editor stripping: plain string length, or X weighted length when
 * `providerIdentifier` is `x`.
 */
export function measureProviderCaptionLength(providerIdentifier: string, strippedText: string): number {
    const text = typeof strippedText === "string" ? strippedText : "";
    if (providerIdentifier.trim().toLowerCase() === "x") {
        return twitterText.parseTweet(text).weightedLength;
    }
    return text.length;
}

/** Channel caption cap, including X Verified (4000) vs standard (280). */
export function resolveProviderMaxLength(
    provider: Pick<SocialProvider, "maxLength">,
    additionalSettingsJson: string | null | undefined
): number {
    const verified = isVerifiedFromAdditionalSettings(parseAdditionalSettings(additionalSettingsJson));
    return provider.maxLength(verified);
}

export function validateProviderCaptionLength(input: {
    providerIdentifier: string;
    provider: Pick<SocialProvider, "maxLength" | "editor" | "name">;
    additionalSettings?: string | null;
    message: string;
    label?: string;
}): string | null {
    const stripped = stripComposerBodyForEditor(input.provider.editor ?? "normal", input.message ?? "");
    if (!stripped) return null;

    const used = measureProviderCaptionLength(input.providerIdentifier, stripped);
    const max = resolveProviderMaxLength(input.provider, input.additionalSettings);
    if (used <= max) return null;

    const label = (input.label ?? `${input.provider.name} caption`).trim() || `${input.provider.name} caption`;
    return `${label} exceeds ${max} characters (${used}/${max}).`;
}

/**
 * Secondary caption bodies that publish with a scheduled post: follow-up replies, Threads
 * finisher / delayed engagement, and cross-account plug comments.
 */
export function collectCaptionTextsFromProviderSettings(
    providerIdentifier: string,
    providerSettings: Record<string, unknown> | null | undefined,
    displayName = providerCaptionDisplayName(providerIdentifier)
): CaptionTextWithLabel[] {
    const out: CaptionTextWithLabel[] = [];
    if (!providerSettings || typeof providerSettings !== "object") return out;

    const replies = extractFollowUpRepliesFromProviderSettingsObject(providerSettings, providerIdentifier);
    for (const reply of replies) {
        pushCaptionText(out, reply.message, `${displayName} follow-up reply`);
    }

    const id = providerIdentifier.trim().toLowerCase();
    if (id === "threads") {
        const threads = isPlainObject(providerSettings.threads) ? providerSettings.threads : null;
        if (threads) {
            if (threads.enabled === true) {
                pushCaptionText(out, threads.message, `${displayName} thread finisher`);
            }
            const engagement = isPlainObject(threads.internalEngagementPlug)
                ? threads.internalEngagementPlug
                : null;
            if (engagement?.enabled === true) {
                pushCaptionText(out, engagement.message, `${displayName} delayed engagement`);
            }
        }
    }

    for (const bucket of CROSS_ACCOUNT_PLUG_BUCKETS) {
        const bucketSettings = providerSettings[bucket];
        if (!isPlainObject(bucketSettings)) continue;
        const plugs = bucketSettings.crossAccountPlugs;
        if (!Array.isArray(plugs)) continue;
        for (const plug of plugs) {
            if (!isPlainObject(plug)) continue;
            const fields = isPlainObject(plug.fields) ? plug.fields : null;
            pushCaptionText(out, fields?.comment, `${displayName} cross-account plug comment`);
        }
    }

    return out;
}

export function validateScheduledCaptionsForIntegration(input: {
    providerIdentifier: string;
    provider: Pick<SocialProvider, "maxLength" | "editor" | "name">;
    additionalSettings?: string | null;
    mainMessage: string;
    providerSettings?: Record<string, unknown> | null;
}): string | null {
    const { providerIdentifier, provider, additionalSettings, mainMessage, providerSettings } = input;
    const shared = { providerIdentifier, provider, additionalSettings };

    const mainError = validateProviderCaptionLength({
        ...shared,
        message: mainMessage,
        label: `${provider.name} caption`,
    });
    if (mainError) return mainError;

    const secondaries = collectCaptionTextsFromProviderSettings(
        providerIdentifier,
        providerSettings,
        provider.name
    );
    for (const { text, label } of secondaries) {
        const error = validateProviderCaptionLength({
            ...shared,
            message: text,
            label,
        });
        if (error) return error;
    }

    return null;
}
